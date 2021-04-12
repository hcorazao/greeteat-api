import GeFirestoreDatabase from "../utils/firebase";
import * as admin from 'firebase-admin';
import { GeResponse } from "../models/response.model";
import { StripeDto } from "../models/stripe/stripeDto.model";

export class UsersRepository {

    readonly collectionName: string = 'users';
    readonly db:FirebaseFirestore.Firestore;
    readonly colection:FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

    constructor(database:FirebaseFirestore.Firestore = GeFirestoreDatabase.getInstance().getStore) {
        this.db = database;        
        this.colection = this.db.collection(this.collectionName);
    }

    public async create(entity: StripeDto): Promise<GeResponse<string>> {
        const result:GeResponse<string> = new GeResponse();

        try {
            await this.colection
                .withConverter(this.getUserConverter())
                .doc(entity.userEmail)
                .set(entity);

            result.response204("Stripe Id was saved.");
        } catch (error) {
            result.response500(error);
        }

        return result;
    }

    public async update(entity: StripeDto):Promise<GeResponse<boolean>> {
        const result:GeResponse<boolean> = new GeResponse();

        try {
            await this.colection
                .doc(entity.userEmail)
                .withConverter(this.getUserConverter())
                .set(entity);
            
            result.response204();
        }
        catch (error)
        {
            result.response500(error);
        }
    
        return result;
    }

    public async get(userEmail: string):Promise<GeResponse<StripeDto>> {
        const result:GeResponse<StripeDto> = new GeResponse();
    
        try {
            const documentSnapshot =
                await this.colection
                    .doc(userEmail)
                    .withConverter(this.getUserConverter())
                    .get();

            if (documentSnapshot.exists && documentSnapshot.id === userEmail) {
                const userStripe = documentSnapshot.data();

                if (userStripe) {
                    result.response200(userStripe);    
                } else {
                    result.response404();
                }  
            } else {
                result.response404();
            }
        } catch (error) {    
            result.response500(error);
        }
    
        return result;
    }

    public async delete(userEmail: string):Promise<GeResponse<any>> {
        const result:GeResponse<any> = new GeResponse();

        try {
            const docRef = 
                await this.colection
                    .doc(userEmail)
                    .withConverter(this.getUserConverter())
                    .get();

            if (docRef.exists && docRef.id === userEmail) {
                const entity = docRef.data();

                if (entity) {
                    if (entity.isDeleted) {
                        result.response410();
                    } else {
                        await this.colection
                            .doc(userEmail)
                            .withConverter(this.getUserConverter())
                            .update({ "isDeleted": true });

                        result.response204();
                    }
                } else {
                    result.response404();
                }
            } else {
                result.response404();
            }
        } catch (error) {
            result.response500(error);
        }

        return result;
    }

    private getUserConverter() {

        // Firestore data converter
        const meetingConverter = {
          toFirestore: function(entity: StripeDto) {
            return  Object.assign({}, entity);
          },
          fromFirestore: function(snapshot: admin.firestore.QueryDocumentSnapshot<StripeDto>) {
              const data = snapshot.data();
              const entity = new StripeDto(
                    data.userEmail,
                    data.stripeId,
                );

                entity.isDeleted = data.isDeleted;

                return entity;
          },
        };
    
        return meetingConverter;
      }
}
