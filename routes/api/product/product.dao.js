var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
var _db;

class Prod{
    prodColl =null;
    constructor(){
        this.initModel();
    }
    async initModel(){
        try{
            _db = await conn.getDB();
            this.prodColl = await _db.collection("product");
        }
        catch(ex){
            console.log(ex);
            process.exit(1);
        }
    }
    async getAll(id){
        const filter = {"user_id": new ObjectID(id)}
        let prods = await this.prodColl(filter);
        return prods.toArray();
    }

    async getWithFilterAndProjection(filter, projection) {
        let p = {
            "projection": projection
        }
        let prods = await this.prodColl.find(filter, p);
        return prods.toArray();
    }

    async updateRelevanceRandom(id) {
        const filter = {"_id": new ObjectID(id)};
        const updateAction = {"$set": {prodRelevance: Math.round(Math.random()*100)/100}};
        return result;
    }

    async getById(id){
        const filter = {"_id": new ObjectID(id)};
        let prodDocument = await this.prodColl.findOne(filter);
        return prodDocument;
    }

    async getByType(type, userId){
        const filter = {"nombreType": type, "user_id": new ObjectID(userId)};
        let cursor = await this.prodColl.find(filter);
        return cursor.toArray();
    }

    async getByprodKey(key, userId){
        const filter = {"prodMeta": key, "user_id": new ObjectID(userId)};
        let cursor = await this.prodColl.find(filter);
        return cursor.toArray();
    }

    async getByfacet(textToSearch, page, itemsPerPage, userId){
        const filter = { prodDesc: RegExp(textToSearch, 'g'), "user_id": new ObjectID(userId)};
        let cursor = await this.prodColl.find(filter);
        let docsMatched = await cursor.count();
        cursor.sort({nombreType:1});
        cursor.skip((itemsPerPage * (page - 1)));
        cursor.limit(itemsPerPage);
        let documents = await cursor.toArray();
        return {
            docsMatched,
            documents,
            page,
            itemsPerPage
        }
    }

    async getAggregatedData(userId){
        const PipeLine = [
            {
                '$match': {
                    'user_id': new ObjectID(userId)
                }
            }, {
                '$gruop': {
                    '_id': '$nombreType',
                    'prodTypeCount': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    '_id': 1
            }
            }
        ];
        const cursor = this.prodColl.aggregate(PipeLine);
        return await cursor.toArray();
    }

    async addNew (nombreType, prodDesc, prodMetaArray, id){
        let newProd = {
            nombreType,
            prodDesc,
            prodMeta: prodMetaArray,
            prodDate: new Date().getTime(),
            user_id: new ObjectID(id)
        }
        let result = await this.prodColl.insertOne(newProd);
        return result;
    }

    async addMetaToprod (prodMetaKey, id){
        let filter = {"_id": new ObjectID(id)};
        let updateJson = {
            "$push": {"prodMeta": prodMetaKey}
        };
        let result = await this.prodColl.updateOne(filter, updateJson);
        return result;
    }

    async daleteById(id) {
        let filter = {"_id": new ObjectID(id)};
        let result = await this.prodColl.deleteOne(filter);
        return result;
    }
}