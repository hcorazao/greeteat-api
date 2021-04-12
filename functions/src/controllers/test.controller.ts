import * as express from "express";
// import TestRepository from "../repository/test.repository";

export default class TestController {
  public path = '/test';
  public router = express.Router();
  // private repo:TestRepository;
 
  constructor() {
    this.intializeRoutes();
    // this.repo = new TestRepository();
  }
 
  public intializeRoutes() {
    this.router.get(`${this.path}/:id`, this.getAllPosts);
    this.router.post(this.path, this.createPost);
  }
 
  getAllPosts = async (request: express.Request, response: express.Response) => {

    // const authHeader = request.headers.authorization;

    // eslint-disable-next-line no-invalid-this
    // await this.repo.create();

    // eslint-disable-next-line no-invalid-this
    // const result = await this.repo.read();

    const voucherId = request.params.id;

    response.json(voucherId);
  } 

  createPost = async (request: express.Request, response: express.Response) => {
    
    response.status(201).json("create: success");
  }
}
