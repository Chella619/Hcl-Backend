const fs = require('fs');
const path = require('path');
const employeeFileName = 'sampledata.txt';
const coursesFileName = 'courses.txt';

const express = require('express');
const router = express.Router();

/**
 * to get courses details
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getCourses = async function (req, res) {
    try {
        const delegateId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = (req.query.search || '').toLowerCase();
        const filter = (req.query.filter || '').toLowerCase();
        const startIndex = (page - 1) * limit;

        const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
        const data = fs.readFileSync(coursesFilePath, 'utf-8');
        const courses = JSON.parse(data);

        const employeeRecord = courses.root.records.find((x) => x.delegate_id === delegateId);

        if (!employeeRecord) {
            return res.status(404).json({ message: 'Delegate not found' });
        }

        let courseList = employeeRecord.records || [];

        if (search) {
            courseList = courseList.filter((c) =>
                (c.course_title || '').toLowerCase().includes(search) ||
                (c.training_provider || '').toLowerCase().includes(search) || 
                (c.country || '').toLowerCase().includes(search) 
            );
        }
        if(filter){
            courseList = courseList.filter((c) =>
                (c.status || '').toLowerCase().includes(filter)
            );
        }

        const total = courseList.length;
        const paginatedCourses = courseList.slice(startIndex, startIndex + limit);

        res.status(200).json({
            total,
            page,
            limit,
            records: paginatedCourses
        });

    } catch (err) {
        console.error('Error reading courses:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * To update courses
 * @param {*} req 
 * @param {*} res 
 */
const updateCourse = (req, res) => {
    try{
        const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
        const data2 = fs.readFileSync(coursesFilePath, 'utf-8');
        let courses = JSON.parse(data2);
    
        const index = courses.root.records.findIndex(e => e.delegate_id == req.params.id);
        if (index !== -1) {
            courses.root.records[index].records = req.body;
            fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2));
            res.json(courses.root.records[index]);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    }
    catch (err) {
        console.error('Error updating employees:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}; 

router.get('/:id', getCourses);
router.post('/:id', updateCourse);
router.delete('/:id', updateCourse);

module.exports = { router, getCourses, updateCourse };
