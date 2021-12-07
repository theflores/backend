var express = require('express');
var router = express.Router();
var ProdDao = require('./product.dao');
var Prod = new ProdDao();

router.get('/all', async (req, res, next)=>{
    try{
      const allSwotEntries = await Prod.getAll(req.user._id);
      return res.status(200).json(allSwotEntries);
    }catch(ex){
      console.log(ex);
      return res.status(500).json({msg:"Error al procesar petición"});
    }
  });

  router.get('/byid/:id', async (req, res, next)=>{
    try {
      const {id} = req.params;
      const oneSwotEntry = await Prod.getById(id);
      return res.status(200).json(oneSwotEntry);
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // byid

  router.get('/bytype/:type', async (req, res, next)=>{
    try {
      const {type} = req.params;
      
      const prods = await Prod.getByType(type, req.user._id);
      return res.status(200).json(prods);
    } catch(ex){
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // get by type

  router.get('/bymeta/:meta', async (req, res, next) => {
    try {
      const { meta } = req.params;
      const prods = await Prod.getByprodKey(meta, req.user._id);
      return res.status(200).json(prods);
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // get by meta

  router.get('/facet/:page/:items', async (req, res, next) => {
    try {
      let { page, items } = req.params;
      page = parseInt(page) || 1;
      items = parseInt(items) || 10;
  
      const prods = await Prod.getByfacet('', page, items, req.user._id);
  
      return res.status(200).json(prods);
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // facet

  router.get('/facet/:page/:items/:text', async (req, res, next)=> {
    try {
      let {page, items, text}  = req.params;
      page = parseInt(page) || 1;
      items = parseInt(items) || 10;
  
      const prods = await Prod.getByFacet(text, page, items, req.user._id);
  
      return res.status(200).json(prods);
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // facet

  router.get('/byrelevancerange/:lower/:upper/:extremes', async (req, res, next)=>{
    try{
      const {lower, upper, extremes } = req.params;
      const filter = (parseInt(extremes) > 0 ) ?
        {
            prodRelevance: {
            "$gte": parseFloat(lower),
            "$lte": parseFloat(upper)
          }
        }
       :
       {
        prodRelevance: {
          "$gt": parseFloat(lower),
          "$lt": parseFloat(upper)
        }
      };
      const prods = await Prod.getWithFilterAndProjection(filter, {});
      return res.status(200).json(prods);
    }catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  });

  router.get('/dashboard', async (req, res, next)=>{
    try{
      const prods = await Prod.getAggregatedData(req.user._id);
      return res.status(200).json(prods);
    }catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  });

  router.post('/new', async (req, res, next)=>{
    try{
      const {
        nombreType,
        prodDesc,
        prodMeta
      } = req.body;
      const prodMetaArray = prodMeta.split('|');
      // validaciones
      const result = await Prod.addNew(nombreType, prodDesc, prodMetaArray, req.user._id);
      console.log(result);
      res.status(200).json({msg:"Agregado Satisfactoriamente"});
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // /new

  router.put('/update/:id', async (req, res, next)=>{
    try {
      const {id} = req.params;
      const {prodMetaKey} = req.body;
      const result = await Prod.addMetaToprod(prodMetaKey, id);
      console.log(result);
      res.status(200).json({"msg":"Modificado OK"});
    } catch (ex){
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // put update
  
  router.delete('/delete/:id', async (req, res, next)=>{
    try {
      const {id} = req.params;
      const result = await Prod.deleteById(id);
      console.log(result);
      return res.status(200).json({"msg":"Eliminado OK"});
    } catch (ex) {
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  }); // delete

  router.get('/fix', async (req, res, next)=>{
    try {
      let prods = await Prod.getWithFilterAndProjection(
        {},
        { _id: 1, swotRelevance:1}
      );
      prods.map(async (o)=>{
        await Prod.updateRelevanceRandom(o._id);
      });
      return res.status(200).json(prods);
    }catch(ex){
      console.log(ex);
      return res.status(500).json({ msg: "Error al procesar petición" });
    }
  });
  module.exports = router;
