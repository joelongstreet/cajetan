const { executeSql } = require('../pg-client');

class Model {
  constructor({ tableName }) {
    this.tableName = tableName;
  }

  async executeSql(sql, err = new Error(`${this.tableName} sql error`)) {
    const res = await executeSql(sql);

    if (res && res.rows && res.rows.length) return res.rows;

    return Promise.reject(err);
  }
}

module.exports = {
  Model,
};
