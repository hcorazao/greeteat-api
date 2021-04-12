import { auth } from 'firebase-admin';
import FirebaseAdminWrapper from './firebase-admin-wrapper';

export class AuthHelper {
  private static instance: AuthHelper;  
  // private authObj: admin.auth. = admin.auth();

  static getInstance(): AuthHelper {

    if (!AuthHelper.instance) {

      FirebaseAdminWrapper.App;  

      AuthHelper.instance = new AuthHelper();
    }

    return AuthHelper.instance;
  }

  async isUserValid(authToken: string): Promise<Boolean> {
    const authService = FirebaseAdminWrapper.App.auth();    
    const decodedToken = authService.verifyIdToken(authToken, false);

    return decodedToken === null;
  }

  async getUserDetails(userId: string): Promise<auth.UserRecord> {
    const authService = FirebaseAdminWrapper.App.auth();    
    const userDetails = await authService.getUser(userId);

    return userDetails;
  }
}
