import AbstractCourse from '../abstractCourses/abstractCourse.model';
import TailoredAssignment from '../tailoredCourses/tailoredAssignment.model';
import Submission from '../submission/submission.model';

import mongoose, { Schema } from 'mongoose';

export default function studentDistributionCalculator(req) {
  var courseId = req.params.id;

  return AbstractCourse.findOne({
    _id: mongoose.Types.ObjectId(courseId)
  }).then(course => {
    //TODO This will return all the submissions for the course. We probably only want to find a student's
    // most recent submission (i.e We don't need to include every submission they've made when analyzing the data),
    //so we need to change the collection we are querying to reflect this
    return Submission.find({ courseId: course._id })
      .then(submissions => {
        //An alternative to the comment above is to come up with some heuristic to determine if a submission is a student's
        //most recent submission
        var students = {};
        for (var i in submissions) {
          var sub = submissions[i];

          //First keep track of the number of attempts
          if (sub.studentId in students) {
            students[sub.studentId].attempts =
              students[sub.studentId].attempts + 1;
          } else {
            students[sub.studentId] = {
              attempts: 1,
              correct: 1
            };
          }

          //then count the submissions that were correct
          if (sub.correct) {
            if (sub.studentId in students) {
              students[sub.studentId].correct =
                students[sub.studentId].correct + 1;
            }
          }
        }
        //console.log(students);

        //Deleted lines 43 - 51. We don't need to know details about the assignment to count how many
        //submissions have been made in a course.
        //We can get all the information we need to know simply by looking at the Submissions collection

        // Get all assignments for the course
        //  var assignments = [];
        // for (var i = 0; i < course.assignments.length; i++) {
        //   assignments.push(
        //     TailoredAssignment.find({
        //       AbstractAssignmentId: course.assignments[i]
        //     })
        //   );
        // }
        return students;
      })
      .then(function(students) {
        //Related to comment above.
        // var totalProblems = 0;
        // for (var j = 0; j < assignments.length; j++) {
        //   totalProblems += assignments[j].problems.length;
        // }

        // Calculate Mean
        var sum = 0;
        var count = 0;
        var percentages = [];
        Object.keys(students).forEach(function(key) {
          var numCorrect = students[key].correct;
          var totalAttempts = students[key].attempts;
          var percentage = numCorrect / totalAttempts;
          percentages.push(percentage);
          sum = sum + percentage;
          count = count + 1;
        });
        var mean = sum / count;

        //Calculate standard deviation
        var stdSum = 0;
        percentages.forEach(function(percentage) {
          stdSum += Math.pow(percentage - mean, 2);
        });
        var standardDeviation = Math.sqrt(stdSum / count);

        return Promise.resolve({
          description:
            'returns the mean and standard deviation for completion of a course',
          mean: mean,
          stdDev: standardDeviation
        });
      });
  });
}
