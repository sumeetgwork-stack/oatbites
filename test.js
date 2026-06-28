const { MongoClient } = require('mongodb');
(async () => {
  const client = new MongoClient('mongodb+srv://oatbites:oatbites@cluster0.0r3wz.mongodb.net/test');
  await client.connect();
  const coll = client.db().collection('test');
  const r = await coll.insertOne({test:1});
  const result = await coll.findOneAndUpdate({_id: r.insertedId}, {$set: {status: 'Paid'}}, {returnDocument: 'after'});
  console.log(result);
  await client.close();
})().catch(console.error);
