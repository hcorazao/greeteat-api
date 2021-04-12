import { IMeeting } from "../models/meeting.interface";
import { Meeting } from "../models/meeting.model";
import GeFirestoreDatabase from "../utils/firebase";
import * as admin from 'firebase-admin';
import { GeResponse } from "../models/response.model";
import RedeemCodes from "../models/redeemCodes.model";

export class MeetingsRepository {

    readonly collectionName: string = 'meetings';
    readonly db:FirebaseFirestore.Firestore;
    readonly colection:FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

    constructor(database:FirebaseFirestore.Firestore = GeFirestoreDatabase.getInstance().getStore) {
        this.db = database;        
        this.colection = this.db.collection(this.collectionName);
    }

    public async create(entity: Meeting): Promise<GeResponse<string>> {
        const result:GeResponse<string> = new GeResponse();

        try {
            const newMeeting = await this.colection
                .withConverter(this.getMeetingConverter())
                .add(entity);

            await this.colection
                .doc(newMeeting.id)
                .update({"Id": newMeeting.id});

            result.response201(newMeeting.id, "Meeting was created.");
        } catch (error) {
            result.response500(error, "Failed to create Meeting.");
        }

        return result;
    }

    public async update(entity: Meeting):Promise<GeResponse<boolean>> {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(entity.Id)
                .withConverter(this.getMeetingConverter())
                .set(entity);
            
            result.response204();
        }
        catch (error)
        {
            result.response500(error, "Failed to update meeting.");
        }
    
        return result;
    }

    public async setVoucherId(meetingId:string, uberId:string):Promise<GeResponse<boolean>> {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(meetingId)
                .update({"VoucherId": uberId});
            
            result.response204();
        }
        catch (error)
        {
            result.response500(error, "failed to set Uber voucher id.");
        }
    
        return result;
    }

    public async setUberVoucherRedeemCodes(meetingId:string, redeemCodes:RedeemCodes, userId:string ) {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            const meetingResponse = await this.get(meetingId, userId);

            if (meetingResponse.isSuccessful && meetingResponse.data) {

                meetingResponse.data.Participants.forEach((participant, index) => {
                    participant.RedeemCode = redeemCodes.redeemCodes[index].code;
                    participant.RedeemUrl = redeemCodes.redeemCodes[index].link;
                });

                await this.colection
                    .doc(meetingId)
                    .update({"Participants": meetingResponse.data.Participants});

                result.response204();
            } else {
                result.response500(meetingResponse, "Failed to set Uber Voucher Redeem Codes.");
            } 
        }
        catch (error)
        {
            result.response500(error, "Failed to set Uber Voucher Redeem Codes.");
        }
    
        return result;
    }

    public async setUberVoucherStatus(meetingId:string, userId:string ) {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            const meetingResponse = await this.get(meetingId, userId);

            if (meetingResponse.isSuccessful && meetingResponse.data) {

                meetingResponse.data.Participants.forEach((participant, index) => {
                    participant.VoucherCodeStatus = "claimed";
                });

                await this.colection
                    .doc(meetingId)
                    .update({"Participants": meetingResponse.data.Participants});

                result.response204();
            } else {
                result.response500(meetingResponse, "Failed to set Uber Voucher Redeem Codes.");
            } 
        }
        catch (error)
        {
            result.response500(error, "Failed to set Uber Voucher Redeem Codes.");
        }
    
        return result;
    }

    public async getMeetingByVoucherId(voucherId:string, userId:string) {
        const result:GeResponse<Meeting> = new GeResponse();
    
        try {
            const querySnapshot =
                await this.colection
                    .where("VoucherId", "==", voucherId)
                    .withConverter(this.getMeetingConverter())
                    .get();

            if (querySnapshot.empty) {
                result.response404(`There is no Meeting with such Voucher id as [${voucherId}].`);
            } else {
                const docRef = querySnapshot.docs[0];

                if (docRef && docRef.exists) {
                    const meeting = docRef.data();

                    if (meeting.UserId === userId) {
                        result.response200(meeting);
                    } else {
                        result.response403(`Meeting with Voucher id [${voucherId}] belongs to other user.`);
                    }  
                } else {
                    result.response404(`There is no Meeting with such Voucher id as [${voucherId}].`);
                }
            }
        } catch (error) {    
            result.response500(error, `Failed to get Meeting with Voucher id [${voucherId}].`);
        }
    
        return result;
    }

    public async get(id: string, userId:string):Promise<GeResponse<Meeting>> {
        const result:GeResponse<Meeting> = new GeResponse();
    
        try {
            const querySnapshot =
                await this.colection
                    .where("Id", "==", id)
                    .withConverter(this.getMeetingConverter())
                    .get();

            if (querySnapshot.empty) {
                result.response404(`There is no Meeting with such id as [${id}].`);
            } else {
                const docRef = querySnapshot.docs[0];

                if (docRef && docRef.exists && docRef.id === id) {
                    const meeting = docRef.data();

                    if (meeting.UserId === userId) {
                        result.response200(meeting);
                    } else {
                        result.response403(`Meeting with id [${id}] belongs to other user.`);
                    }  
                } else {
                    result.response404(`There is no Meeting with such id as [${id}].`);
                }
            }
        } catch (error) {    
            result.response500(error, `Failed to get Meeting with id [${id}].`);
        }
    
        return result;
    }

    public async delete(id: string, userId: string):Promise<GeResponse<any>> {
        const result:GeResponse<any> = new GeResponse();

        try {
            const querySnapshot = 
                await this.colection
                    // .where("userId", "==", userId)
                    .where("Id", "==", id)
                    .withConverter(this.getMeetingConverter())
                    .get();

            if (querySnapshot.empty) {
                result.response404(`There is no Meeting with such id as [${id}].`);
            } else {
            
                const docRef = querySnapshot.docs[0];

                if (docRef.exists && docRef.id === id) {
                    const meeting = docRef.data();

                    if (meeting.UserId === userId) {

                        if (meeting.IsDeleted) {
                            result.response410(`Meeting with id [${id}] already deleted.`);
                        } else {
                            await this.colection
                                .doc(id)
                                .withConverter(this.getMeetingConverter())
                                .update({ "IsDeleted": true });
    
                            result.response204(`Meeting with id [${id}] has been deleted successfully.`);
                        }
                    } else {
                        result.response403(`Meeting with id [${id}] belongs to other user.`);
                    }
                } else {
                    result.response404(`There is no Meeting with such id as [${id}].`);
                }
            }
        } catch (error) {
            result.response500(error);
        }

        return result;
    }

    public async getMeetingStatus(id: string, userId: string):Promise<number> {
        try {
            const querySnapshot = 
                await this.colection
                    .where("Id", "==", id)
                    .withConverter(this.getMeetingConverter())
                    .get();

            if (querySnapshot.empty) {
                return 404;
            }
            
            const docRef = querySnapshot.docs[0];

            if (docRef.exists && docRef.id === id) {
                const meeting = docRef.data();

                if (meeting.UserId === userId) {

                    if (meeting.IsDeleted) {
                        return 410;
                    } else {
                        return 200;
                    }
                } else {
                    return 403;
                }
            } else {
                return 404
            }
            
        } catch (error) {
            return 500;
        }
    }

    public async setPrepaidStatus(meetingId:string) {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(meetingId)
                .update({"IsPrepayed": true});
            
            result.response204("Predaid status was changed to true.");
        }
        catch (error)
        {
            result.response500(error, "Failed to set is meeting prepaid or not.");
        }
    
        return result;
    }

    public async setChargeId(meetingId:string, chargeId: string) {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(meetingId)
                .update({"ChargeId": chargeId});
            
            result.response204("Charge Id was saved.");
        }
        catch (error)
        {
            result.response500(error, "Failed to save a charge id.");
        }
    
        return result;
    }

    public async setRefundId(meetingId:string, refundId: string) {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(meetingId)
                .update({"RefundId": refundId});
            
            result.response204("Refund Id was saved.");
        }
        catch (error)
        {
            result.response500(error, "Failed to save a refund id.");
        }
    
        return result;
    }

    private MeetingToSimpleObject(entity: IMeeting): Object {
        const partisipantsSo: any[] = [];
    
        entity.Participants.forEach(partisipant => {
          partisipantsSo.push(Object.assign({}, partisipant));
        });
    
        const newMeeting:any = Object.assign({}, entity);
    
        newMeeting.Participants = partisipantsSo;
    
        return newMeeting;
      }

    private getMeetingConverter() {
        const mtso = this.MeetingToSimpleObject;
    
        // Firestore data converter
        const meetingConverter = {
          toFirestore: function(meeting: Meeting) {
            return mtso(meeting);
          },
          fromFirestore: function(snapshot: admin.firestore.QueryDocumentSnapshot<Meeting>) {
              const data = snapshot.data();
              const entity = new Meeting(
                    data.TopicName,
                    data.StartTime,
                    data.Duration,
                    data.Participants,
                    data.VoucherPrice,
                    data.IsSecured,
                    data.Passcode,
                    data.Description,
                    data.PublicMeetingId,
                    data.ZoomMeetingId,
                    data.UserId,
                );
    
                entity.Id = data.Id;
                entity.IsDeleted = data.IsDeleted;
                entity.IsPrepayed = data.IsPrepayed;
                entity.ChargeId = data.ChargeId;
                entity.VoucherId = data.VoucherId;
                entity.RefundId = data.RefundId;
    
                return entity;
          },
        };
    
        return meetingConverter;
      }
}
