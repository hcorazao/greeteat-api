import * as express from "express";
import { createValidator, ValidatedRequest } from "express-joi-validation";
import {MeetingsRepository} from "../repository/meetings.repository";
import { createMeetingDto } from "../models/createMeetingDto.model";
import { updateMeetingDto } from "../models/updateMeetingDto.model";
import { IQueryIdSchema } from "../validators/meetings/add.validator";
import {ICreateMeetingSchema, CreateMeetingValidator } from "../validators/meetings/create.validator";
import { IUpdateMeetingSchema, UpdateMeetingValidator } from "../validators/meetings/update.validator";
import { Meeting } from "../models/meeting.model";
import { IMeeting } from "../models/meeting.interface";
import { Participant } from "../models/participant.model";
// import { UberManager } from "../managers/uber.manager";
// import CreateVoucherDto from "../models/createVoucher.model";
import { GeResponse } from "../models/response.model";
import { MeetingManager } from "../managers/meeting.manager";

export default class MeetingsController {
  public path = '/meetings';
  public router = express.Router();
  private createMeetingValidator: CreateMeetingValidator;
  private updateMeetingValidator: UpdateMeetingValidator;
  // private queryIdValidator: QueryIdValidator;
  private repo: MeetingsRepository;
  private manager: MeetingManager;
 
  constructor() {
    // this.manager = new UberManager();
    this.repo = new MeetingsRepository();
    this.manager = new MeetingManager();
    this.createMeetingValidator = new CreateMeetingValidator();
    this.updateMeetingValidator = new UpdateMeetingValidator();
    // this.queryIdValidator = new QueryIdValidator();
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    const validator = createValidator();

    this.router.get(
      `${this.path}/:id`,
      // validator.query(this.queryIdValidator.querySchema),
      this.getMeeting);

    this.router.post(
      this.path,
      validator.body(this.createMeetingValidator.querySchema),
      this.createMeeting);

    this.router.put(
      this.path,
      validator.body(this.updateMeetingValidator.querySchema),
      this.editMeeting);

    this.router.delete(
      `${this.path}/:id`,
      // validator.query(this.queryIdValidator.querySchema),
      this.deleteMeeting);
  }
 
  getMeeting = async (request: ValidatedRequest<IQueryIdSchema>, response: express.Response) => {
    try {
      const meetingId:string = request.params.id;

      // eslint-disable-next-line no-invalid-this
      const meetingResponse = await this.repo.get(meetingId, request.userid);

      response.status(meetingResponse.statusCode).json(meetingResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to get Meeting.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  createMeeting = async (request: ValidatedRequest<ICreateMeetingSchema>, response: express.Response) => {
    try {
      const meetingDto: createMeetingDto = request.body;

      const partisipants: Participant[] = 
          meetingDto.participants.map(x => new Participant(x, false, false));

      const newMeeting:IMeeting = new Meeting(
        meetingDto.topicName,
        meetingDto.startTime.toISOString(),
        meetingDto.duration,
        partisipants,
        meetingDto.voucherPrice,
        meetingDto.isSecured,
        meetingDto.passcode ?? "",
        meetingDto.description ?? "",
        "public-meeting-id",
        "private-zoom-id",
        request.userid,
      );

      // eslint-disable-next-line no-invalid-this
      const meetingResponse = await this.repo.create(newMeeting);

      // if (meetingResponse.isSuccessful && meetingResponse.data) {

      //   const newVoucher = 
      //     new CreateVoucherDto(
      //       meetingDto.topicName, 
      //       meetingDto.startTime.getTime(),
      //       meetingDto.endTime.getTime(),
      //       meetingDto.participants.length,
      //       meetingDto.voucherPrice,
      //       meetingResponse.data);

      //   // eslint-disable-next-line no-invalid-this
      //   const uberResponse = await this.manager.createVoucher(newVoucher, request.userid);

      //   if (uberResponse.isSuccessful) {
      //     response.status(meetingResponse.statusCode).json(meetingResponse);
      //   } else {
      //     const geResponse = new GeResponse<any>();
      //     geResponse.response500(uberResponse, "Failed to create Voucher.");
      //     response.status(geResponse.statusCode).json(geResponse);
      //   }

      //   return;
      // }

      response.status(meetingResponse.statusCode).json(meetingResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to create Meeting.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  editMeeting = async (request: ValidatedRequest<IUpdateMeetingSchema>, response: express.Response) => {
    try {
      const meetingDto:updateMeetingDto = request.body;

      //get participants
      const userId:string = request.userid;

      // eslint-disable-next-line no-invalid-this
      const oldMeeting = await this.repo.get(meetingDto.id, userId);

      let participants: Participant[] = []; 
        // meetingDto.participants.map(x => new Participant(x, false, false));
        

      if (oldMeeting.isSuccessful && oldMeeting.data) {

        participants = oldMeeting.data.Participants;

        const participantsToRemove = oldMeeting.data.Participants.filter(x => !meetingDto.participants.includes(x.Email));
        const newParticipants = meetingDto.participants.filter(x => !oldMeeting.data?.Participants.map(y => y.Email).includes(x));

        participantsToRemove.forEach(x => {
          const index = participants.indexOf(x, 0);

          if (index > -1) {
            participants.splice(index, 1);
          }
        });

        newParticipants.forEach(x => {
          const newParticipant = new Participant(x, false, false);
          
          participants.push(newParticipant);
        });

      } else {
        response.status(oldMeeting.statusCode).json(oldMeeting);
        return;
      }

      const newMeeting:IMeeting = new Meeting(
        meetingDto.topicName,
        meetingDto.startTime.toISOString(),
        meetingDto.duration,
        participants,
        meetingDto.voucherPrice,
        meetingDto.isSecured,
        meetingDto.passcode,
        meetingDto.description,
        "public-meeting-id",
        "zoom-meeting-id",
        userId,
      );

      newMeeting.Id = meetingDto.id;
      newMeeting.VoucherId = oldMeeting.data.VoucherId;
      newMeeting.ChargeId = oldMeeting.data.ChargeId;
      newMeeting.RefundId = oldMeeting.data.RefundId;
      newMeeting.IsPrepayed = oldMeeting.data.IsPrepayed;
      newMeeting.IsDeleted = oldMeeting.data.IsDeleted;

      // eslint-disable-next-line no-invalid-this
      const updateResponse = await this.repo.update(newMeeting);

      response.status(updateResponse.statusCode).json(updateResponse);

    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to edit Meeting.");
      response.status(geResponse.statusCode).json(geResponse);
    }
  }

  deleteMeeting = async (request: ValidatedRequest<IQueryIdSchema>, response: express.Response) => {
    try {
      const meetingId:string = request.params.id;

      // eslint-disable-next-line no-invalid-this
      const deleteResponse = await this.manager.delete(meetingId, request.userid);

      response.status(deleteResponse.statusCode).json(deleteResponse);
      
    } catch (error) {
      const geResponse = new GeResponse<any>();
      geResponse.response500(error, "Failed to delete Meeting.");

      response.status(geResponse.statusCode).json(geResponse);
    }
  }
}
