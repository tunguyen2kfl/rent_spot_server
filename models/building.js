"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Building extends Model {
    static associate(models) {
      // define associations here
    }
  }

  Building.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.STRING,
      website: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      inviteCode: DataTypes.STRING,
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "building",
      tableName: "buildings",
    }
  );

  return Building;
};