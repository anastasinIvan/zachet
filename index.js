const axios = require('axios')
const sortFunc = require('./functions/sort.js')
const date = new Date()
const moment = require('moment')
const extraDate = {
  year: date.getFullYear(),
  month: date.getMonth(),
  day: date.getDay(),
}
const DataBase = require('nedb-promises')

class Logs {
  #logs = [];
  #axios = axios.create({ baseURL: 'http://www.dsdev.tech'})
  year;
  month;
  day;
  constructor(config = extraDate) {
    this.year = config.year || extraDate.year
    this.month = config.month || extraDate.month
    this.day = config.day || extraDate.day
  }

  async getLogs() {
    const {data} = await this.#axios.get('/logs/' + this.assemblyDate())
    this.logs = data.logs
  }

  get logs() {
    return this.#logs
  }
  set logs(v) {
    this.#logs = v
  }
  assemblyDate(split = '') {
    return `${this.year}${split}${this.month}${split}${this.day}`
  }
  sort(type = 'asc') {
    let functionSort = undefined
    if (type.toLowerCase() === "asc") {
      functionSort = (a, b) => moment(b.created_at).unix() - moment(a.created_at).unix()
    }
    if (type.toLowerCase() === 'desc') {
      functionSort = (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix()
    }
    if (!functionSort) {
      throw new Error('Type can only be ASC or DESC')
    }
    this.#logs = sortFunc(this.logs, functionSort)
    return this.#logs
  }
}



const logManager = new Logs({year: '2021', month: '02', day: '04'})
logManager.getLogs()
  .then(async () => {
    console.log(logManager.sort('asc'))
    const db = DataBase
      .create(`database/logs-${logManager.assemblyDate('_')}.db`)
    for (const log of logManager.sort()) {
      await db.insert(log)
    }
  })
