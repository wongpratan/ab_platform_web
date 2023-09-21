//
// ABModelAPI
//
// Represents the Data interface for an ABObjectQuery data.

const ABModel = require("./ABModel");

module.exports = class ABModelAPI extends ABModel {
   ///
   /// Instance Methods
   ///

   /**
    * @method batchCreate
    * update model values on the server.
    */
   batchCreate(values) {
      var error = new Error(
         "ABObjectQuery.ABModelAPI.batchCreate() does not be implemented."
      );
      return Promise.reject(error);
   }

   /**
    * @method create
    * update model values on the server.
    */
   async create(values) {
      if (this.object.isFetched && this.object.readonly === 1)
         return await Promise.reject(new Error("This is the read only object"));

      await super.create(values);
   }

   /**
    * @method delete
    * remove this model instance from the server
    * @param {integer|UUID} id  the .id of the instance to remove.
    * @return {Promise}
    */
   delete(id) {
      var error = new Error(
         "ABObjectQuery.ABModelAPI.delete() does not be implemented."
      );
      return Promise.reject(error);
   }

   /**
    * @method update
    * update model values on the server.
    */
   update(id, values) {
      var error = new Error(
         "ABObjectQuery.ABModelAPI.update() does not be implemented."
      );
      return Promise.reject(error);
   }

   /**
    * @method batchUpdate
    * update value to many rows on the server.
    */
   batchUpdate({ rowIds, values }) {
      var error = new Error(
         "ABObjectQuery.ABModelAPI.batchUpdate() does not be implemented."
      );
      return Promise.reject(error);
   }
};
