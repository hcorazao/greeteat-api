import * as admin from 'firebase-admin';

class FirebaseAdminWrapper {
    private static applicationInstance: admin.app.App;

    static get App(): admin.app.App {
      if (!this.applicationInstance) {
        this.applicationInstance = admin.initializeApp();
      }

      return this.applicationInstance;
    }
}

export default FirebaseAdminWrapper;