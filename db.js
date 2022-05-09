const sqlite3 = require('sqlite3')
const { Pool, query } = require('pg')

class DB {
	constructor() {
	//constructor(path) {
		//this.db = new sqlite3.Database(path)
		this.db = new Pool({
			user: process.env.user,
			host: process.env.host,
			database: process.env.database,
			password: process.env.password,
			port: process.env.port,
		})
		this._createTables()
	}

	_createTables() {
		this._createRequestsTable()
		this._createUsersTable()
	}

	_createRequestsTable() {
		const sql = `
			create table if not exists requests(
				id serial primary key,
				"from" text,
				"to" text,
				url text,
				status text,
				date text,
				remark text,
				fix text
			)
		`
		this.db.query(sql)
	}

	_createUsersTable() {
		const sql = `
			create table if not exists users(
				id text primary key,
				username text,
				first_name text,
				last_name text
			)
		`
		this.db.query(sql)
	}

	getUserById(id) {
		return new Promise(((resolve, reject) => {
			const sql = `
			select * from users
			where id = '${id}'
		`
			console.log(sql)
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					console.log(res.res)
					resolve(res.rows[0])
				}
			})
		}))
	}

	getUserByUsername(username) {
		return new Promise(((resolve, reject) => {
			const sql = `
			select * from users
			where username = '${username}'
		`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		}))
	}

	createUser(user) {
		return new Promise((resolve, reject) => {
			const sql = `
			insert into users
			(id, username, first_name)
			values('${user.id}', '${user.username}', '${user.first_name}')
			returning *
		`
		this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}

	updateUser(user) {
		return new Promise((resolve, reject) => {
			const sql = `
			update users
			set username = '${user.username}', first_name = '${user.first_name}'
			where id = '${user.id}'
			returning *
		`
		this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}

	getRequestById(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where id  = ${id}
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}
	getCompletedRequests(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where ("from" = '${id}' or "to" = '${id}') and status = 'complete';
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows)
				}
			})
		})
	}

	getRequestsFrom(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where "from" = '${id}' and status != 'complete'
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows)
				}
			})
		})
	}

	getRequestsTo(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where "to"  = '${id}'  and status != 'complete'
			`
			console.log(sql)
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows)
				}
			})
		})
	}

	getRequestRemark(id) {
		return new Promise((resolve, reject) => {
			const sql = `
			select * from requests
			where ("from" = '${id}' or "to" = '${id}') and status = 'remark';
			`

			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows)
				}
			})
		})
	}

	getRequestFix(id) {
		return new Promise((resolve, reject) => {
			const sql = `
			select * from requests
			where ("from" = '${id}' or "to" = '${id}') and status = 'fix';
			`

			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows)
				}
			})
		})
	}

	createRequest(request) {
		return new Promise(((resolve, reject) => {
			const sql = `
			insert into requests
			("from", "to", url, date, status, remark, fix)
			values('${request.from}', '${request.to}', '${request.url}', '${request.date}', 'new', '', '')
			returning *
			`
			this.db.query(sql,(err, res) => { 
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		}))

	}

	remarkRequest(id, remark) {
		return new Promise((resolve, reject) =>  {
			const sql = `
				update requests
				set remark = '${remark}', status = 'remark'
				where id = ${id}
				returning *
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}

	fixRequest(id, fix) {
		return new Promise((resolve, reject) =>  {
			const sql = `
				update requests
				set fix = '${fix}', status = 'fix'
				where id = ${id}
				returning *
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}

	completeRequest(id) {
		return new Promise((resolve, reject) =>  {
			const sql = `
				update requests
				set status = 'complete'
				where id = ${id}
				returning *
			`
			this.db.query(sql, (err, res) => {
				if(err) {
					reject(err)
				} else {
					resolve(res.rows[0])
				}
			})
		})
	}

	deleteRequest() {

	}
}

module.exports = DB