import { Router } from "express";
import {
  getKeys,
  getKeysBrands,
  getKeysByBrand,
} from "../controllers/keys.controller.js";

const router = Router();

router.get("/", getKeys);
router.get("/brands", getKeysBrands);
router.get("/brands/:name", getKeysByBrand);


export default router;
