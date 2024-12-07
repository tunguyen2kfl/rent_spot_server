"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {
      // define associations here
    }
  }

  Schedule.init(
    {
      summary: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: DataTypes.DATE,
      roomId: DataTypes.INTEGER,
      buildingId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      color: DataTypes.STRING,
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      attendees: DataTypes.STRING,
      organizer: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      updatedBy: DataTypes.INTEGER,
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "schedule",
      tableName: "schedules",
    }
  );

  return Schedule;
};