const mongoose = require('mongoose')

const courseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    completedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    }
})

module.exports = mongoose.model("courseProgress", courseProgressSchema)