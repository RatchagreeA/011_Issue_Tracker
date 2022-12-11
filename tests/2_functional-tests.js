const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
let id1;
let issue_title1;
let issue_text1;
let created_on1;
let updated_on1;
let created_by1;
let assigned_to1;
let open1;
let status_text1;
suite("Functional Tests", function () {
  suite("POST request to /api/issues/{project}", function () {
    test("1: Create an issue with every field", function (done) {
      const issue_title = "test issue 1";
      const issue_text = "functional test1";
      const created_by = "tester1";
      const assigned_to = "Rat1";
      const status_text = "waiting1";
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
        })
        .end(function (err, res) {
          id1 = res.body._id;
          issue_title1 = res.body.issue_title;
          issue_text1 = res.body.issue_text;
          created_on1 = res.body.created_on;
          updated_on1 = res.body.updated_on;
          created_by1 = res.body.created_by;
          assigned_to1 = res.body.assigned_to;
          open1 = res.body.open;
          status_text1 = res.body.status_text;
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, issue_title);
          assert.equal(res.body.issue_text, issue_text);
          assert.equal(res.body.created_by, created_by);
          assert.equal(res.body.assigned_to, assigned_to);
          assert.equal(res.body.status_text, status_text);
          done();
        });
    });

    test("2: Create an issue with only required fields", function (done) {
      const issue_title = "test issue 2";
      const issue_text = "functional test2";
      const created_by = "tester2";
      const assigned_to = "";
      const status_text = "";
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, issue_title);
          assert.equal(res.body.issue_text, issue_text);
          assert.equal(res.body.created_by, created_by);
          assert.equal(res.body.assigned_to, assigned_to);
          assert.equal(res.body.status_text, status_text);
          done();
        });
    });

    test("3: Create an issue with missing required fields", function (done) {
      const issue_title = "test issue 3";
      const issue_text = "functional test";
      const created_by = "";
      const assigned_to = "";
      const status_text = "";
      chai
        .request(server)
        .post("/api/issues/projects")
        .set("content-type", "application/json")
        .send({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("GET request to /api/issues/{project}", function () {
    test("4: View issues on a project", function (done) {
      chai
        .request(server)
        .get("/api/issues/projects")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.length, 2);
          done();
        });
    });

    test("5: View issues on a project with one filter", function (done) {
      chai
        .request(server)
        .get("/api/issues/projects")
        .query({ _id: id1 })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id: id1,
            issue_title: issue_title1,
            issue_text: issue_text1,
            created_on: created_on1,
            updated_on: updated_on1,
            created_by: created_by1,
            assigned_to: assigned_to1,
            open: open1,
            status_text: status_text1,
          });
          done();
        });
    });

    test("6: View issues on a project with multiple filters", function (done) {
      chai
        .request(server)
        .get("/api/issues/projects")
        .query({
          issue_title: issue_title1,
          issue_text: issue_text1,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body[0], {
            _id: id1,
            issue_title: issue_title1,
            issue_text: issue_text1,
            created_on: created_on1,
            updated_on: updated_on1,
            created_by: created_by1,
            assigned_to: assigned_to1,
            open: open1,
            status_text: status_text1,
          });
          done();
        });
    });
  });

  suite("PUT request to /api/issues/{project}", function () {
    test("7: Update one field on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/projects")
        .send({
          _id: id1,
          issue_title: "issue_title1 update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("8: Update multiple fields on an issue", function (done) {
      chai
        .request(server)
        .put("/api/issues/projects")
        .send({
          _id: id1,
          issue_text: "issue_text1 update",
          created_by1: "created_by1 update",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("9: Update an issue with missing _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/projects")
        .send({
          issue_text: "issue_text1 update fail",
          created_by1: "created_by1 update fail",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });

    test("10: Update an issue with no fields to update", function (done) {
      chai
        .request(server)
        .put("/api/issues/projects")
        .send({
          _id: id1,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("11: Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/projects")
        .send({
          _id: "invalid_id",
          issue_text: "update fail",
          created_by1: "update fail",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });
  });

  suite("DELETE request to /api/issues/{project}", function () {
    test("12: Delete an issue", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({
          _id: id1,
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test("13: Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({
          _id: "invalid_id",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "invalid_id");
          done();
        });
    });

    test("14: Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/projects")
        .send({})
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
