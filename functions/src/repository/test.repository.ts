import GeFirestoreDatabase from "../utils/firebase";

export default class TestRepository {

    readonly collectionName: string = 'test-local';
    readonly db:FirebaseFirestore.Firestore;

    constructor(database:FirebaseFirestore.Firestore = GeFirestoreDatabase.getInstance().getStore) { // TODO: Refactor dependency.
        this.db = database;
    }

    async create() {
        await this.db.collection(this.collectionName).add({
            first: 'tryIt-1',
            last: 'doIt-1',
        });
    }

    async read():Promise<FirebaseFirestore.DocumentData[]> {
        const snapshot = await this.db.collection('test-local').get();

        const allRecords = snapshot.docs.map(doc => doc.data());

        return allRecords;
    }
}
