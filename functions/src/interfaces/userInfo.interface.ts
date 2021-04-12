import ICard from "./card.interface";

export default interface IUserInfo {
    phoneNumber: string;
    company: string;
    position: number;
    isGoogleAccountLinked: string;
    cards: ICard[];
  }