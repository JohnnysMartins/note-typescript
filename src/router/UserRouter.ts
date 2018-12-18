import { Request, Response, NextFunction, Router } from 'express'
import * as status from 'http-status-codes'
import { default as User } from "../model/User";
import GenericException from "../exception/GenericException";
import { Types } from 'mongoose';

class UserRouter {
	public router: Router

	constructor() {
		this.router = Router()
		this.routes()
	}

	public routes() {
		this.router.get('/', this.getAllUsers)
		this.router.get('/:id', this.getUserById)
		this.router.post('/', this.save)
		this.router.delete('/:id', this.delete)
	}

	private async getAllUsers(req: Request, res: Response) {
		try {
			const result = await User.find()
			const users = result.map(document => {
				return {
					...document._doc,
					request: {
						type: 'GET',
						uri: `http://localhost:3000/api/v1/users/${document._id}`
					}
				}
			})
			res.status(status.ACCEPTED).json(users)
		} catch (err) {
			new GenericException(err.name, err.message)
		}
	}

	private async getUserById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const user = await User.findById(id).exec()
			res.status(status.ACCEPTED).json(user)
		} catch (err) {
			new GenericException(err.name, err.message)
		}
	}

	private async save(req: Request, res: Response) {
		try {
			const { name, password } = req.body
			const user = new User({
				_id: new Types.ObjectId(),
				name: name,
				password: password
			})
			const createdUser = await user.save()
			res.status(status.CREATED).json({ createdUser: createdUser })
		} catch (err) {
			new GenericException(err.name, err.message)
		}
	}

	private async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const result = User.remove({ _id: id }).exec()
			res.status(status.ACCEPTED).json(result)
		} catch (err) {
			new GenericException(err.name, err.message)
		}
	}
}

export default new UserRouter().router