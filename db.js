const sqlite3 = require('sqlite3')

class DB {
	constructor(path) {
		this.db = new sqlite3.Database(path)
		this._createTables()
	}

	_createTables() {
		this._createRequestsTable()
		this._createUsersTable()
	}

	_createRequestsTable() {
		const sql = `
			create table if not exists requests(
				id integer primary key autoincrement,
				'from' text,
				'to' text,
				url text,
				status text,
				date text,
				remark text,
				fix text
			)
		`
		this.db.run(sql)
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
		this.db.run(sql)
	}

	getUserById(id) {
		return new Promise(((resolve, reject) => {
			const sql = `
			select * from users
			where id = ${id}
		`
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
				}
			})
		}))
	}

	getUserByUsername(username) {
		return new Promise(((resolve, reject) => {
			const sql = `
			select * from users
			where username = ?
		`
			this.db.all(sql, username, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
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
		this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
				}
			})
		})
	}

	updateUser(user) {
		return new Promise((resolve, reject) => {
			const sql = `
			update users
			set username = '${user.username}', first_name = '${user.username}'
			where id = "${user.id}"
			returning *
		`
		this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
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
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
				}
			})
		})
	}
	getCompletedRequests(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where "from" = "${id}" and status = "complete";
				select * from requests
				where "to" = "${id}" and status = "complete";
				"
			`
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows)
				}
			})
		})
	}

	getRequestsFrom(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where "from" == "${id}" and status != 'complete'
			`
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows)
				}
			})
		})
	}

	getRequestsTo(id) {
		return new Promise((resolve, reject) => {
			const sql = `
				select * from requests
				where "to"  = "${id}"  and status != 'complete'
			`
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows)
				}
			})
		})
	}

	createRequest(request) {
		return new Promise(((resolve, reject) => {
			const sql = `
			insert into requests
			('from', 'to', url, date, status, remark, fix)
			values(${request.from}, '${request.to}', '${request.url}', '${request.date}', 'new', '', '')
			returning *
			`
			this.db.all(sql,(err, rows) => { 
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
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
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
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
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
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
			this.db.all(sql, (err, rows) => {
				if(err) {
					reject(err)
				} else {
					resolve(rows[0])
				}
			})
		})
	}

	deleteRequest() {

	}
}

module.exports = DB