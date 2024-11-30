"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      // define associations here
    }
  }

  Room.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      buildingId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      description: DataTypes.STRING,
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "room",
      tableName: "rooms",
    }
  );

  return Room;
};