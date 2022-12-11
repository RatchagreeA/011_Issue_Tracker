"use strict";

const Issue = require("../models").Issue;
const Project = require("../models").Project;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;
      Project.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        !_id ? { $match: {} } : { $match: { "issues._id": ObjectId(_id) } },
        !open ? { $match: {} } : { $match: { "issues.open": open } },
        !issue_title
          ? { $match: {} }
          : { $match: { "issues.issue_title": issue_title } },
        !issue_text
          ? { $match: {} }
          : { $match: { "issues.issue_text": issue_text } },
        !created_by
          ? { $match: {} }
          : { $match: { "issues.created_by": created_by } },
        !assigned_to
          ? { $match: {} }
          : { $match: { "issues.assigned_to": assigned_to } },
        !status_text
          ? { $match: {} }
          : { $match: { "issues.status_text": status_text } },
      ]).exec((err, data) => {
        if (err) {
          res.json(err);
          return console.log("err : ", err);
        }
        if (!data) {
          res.json([]);
        } else {
          let arrIssues = data.map((prj) => prj.issues);
          res.json(arrIssues);
        }
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const newIssue = new Issue({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || "",
      });
      Project.findOne({ name: project }, (err, projectdata) => {
        if (err) {
          res.json(err);
          return console.log("err : ", err);
        }
        if (!projectdata) {
          const newProject = new Project({ name: project });
          newProject.issues.push(newIssue);
          newProject.save((err, data) => {
            if (err) {
              res.json(err);
              return console.log("err : ", err);
            }
            res.json(newIssue);
          });
        } else {
          projectdata.issues.push(newIssue);
          projectdata.save((err, data) => {
            if (err) {
              res.json(err);
              return console.log("err : ", err);
            }
            res.json(newIssue);
          });
        }
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }
      Project.findOne({ name: project }, (err, projectdata) => {
        if (err) {
          res.json(err);
          return console.log("err : ", err);
        }
        if (!projectdata) {
          res.json({ error: "could not update", _id: _id });
          return;
        }
        const issueData = projectdata.issues.id(_id);
        if (!issueData) {
          res.json({ error: "could not update", _id: _id });
          return;
        }
        issueData.issue_title = issue_title || issueData.issue_title;
        issueData.issue_text = issue_text || issueData.issue_text;
        issueData.updated_on = new Date();
        issueData.created_by = created_by || issueData.created_by;
        issueData.assigned_to = assigned_to || issueData.assigned_to;
        issueData.open = open || issueData.open;
        issueData.status_text = status_text || issueData.status_text;
        projectdata.save((err, data) => {
          if (err) {
            res.json(err);
            return console.log("err : ", err);
          }
          if (!data) {
            res.json({ error: "could not update", _id: _id });
          } else {
            res.json({ result: "successfully updated", _id: _id });
          }
        });
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      Project.findOne({ name: project }, (err, projectdata) => {
        if (!projectdata) {
          res.send({ error: "could not delete", _id: _id });
          return;
        } else {
          const issueData = projectdata.issues.id(_id);
          if (!issueData) {
            res.send({ error: "could not delete", _id: _id });
            return;
          }
          issueData.remove();

          projectdata.save((err, data) => {
            if (!data) {
              res.json({ error: "could not delete", _id: issueData._id });
            } else {
              res.json({ result: "successfully deleted", _id: issueData._id });
            }
          });
        }
      });
    });
};
