import FirebaseAdminWrapper from './firebase-admin-wrapper';

class GeFirestoreDatabase {
  private static store: FirebaseFirestore.Firestore;
  private static instance: GeFirestoreDatabase;  

  static getInstance(): GeFirestoreDatabase {

    if (!GeFirestoreDatabase.instance) {

      GeFirestoreDatabase.store = FirebaseAdminWrapper.App.firestore(); // TODO: Refactor dependency.

      if (process.env.IS_LOCAL) {
        GeFirestoreDatabase.store.settings({
          host: 'localhost:8080',
          ssl: false,
        });
      }
        
      GeFirestoreDatabase.instance = new GeFirestoreDatabase();
    }

    return GeFirestoreDatabase.instance;
  }

  get getStore(): FirebaseFirestore.Firestore {
    return GeFirestoreDatabase.store;
  }
}

export default GeFirestoreDatabase;