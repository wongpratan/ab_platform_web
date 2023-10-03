const atomicjs = require("atomicjs");
const ABObjectApiCore = require("../core/ABObjectApiCore");

module.exports = class ABObjectApi extends ABObjectApiCore {
   constructor(attributes, AB) {
      super(attributes, AB);
   }

   async fetchData(insertDataMax = 20) {
      if (this.isFetched) return;

      const headers = this.headers;

      const response = await atomicjs(this.request.url, {
         method: this.request.verb,
         headers,
         data: {},
         timeout: null,
         withCredentials: false,
      });

      let parsedResponse = this.dataFromKey(response);

      const model = this.model();

      if (parsedResponse.length == null || parsedResponse.length === 0) {
         const data = {};

         this.response.fields.forEach((f) => {
            data[f.columnName] = parsedResponse[f.columnName];
         });

         await model.create(data);

         return;
      }

      let pendingModelCreate = [];

      for (let i = 0; i < parsedResponse.length; i++) {
         const data = {};

         this.response.fields.forEach((f) => {
            data[f.columnName] = parsedResponse[i][f.columnName];
         });

         pendingModelCreate.push(model.create(data));

         if (pendingModelCreate % insertDataMax === 0)
            await Promise.all(pendingModelCreate);
      }

      if (pendingModelCreate.length > 0) await Promise.all(pendingModelCreate);

      this.isFetched = true;

      await this.save();
   }

   /**
    * @method save()
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    *						.resolve( {this} )
    */
   async save() {
      return await super.save(true);
   }

   dataFromKey(data) {
      let result = data;

      (this.response.dataKey ?? "").split(".").forEach((key) => {
         if (key == "" || key == null) return;
         result = result?.[key];
      });

      return result;
   }

   get headers() {
      const headers = {};

      (this.request.headers ?? []).forEach((header) => {
         if (header?.value == null) return;

         headers[header.key] = header.value;
      });

      return headers;
   }
};
