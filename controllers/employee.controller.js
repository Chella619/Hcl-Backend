const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const employeeFileName = 'sampledata.txt';
const coursesFileName = 'courses.txt';

/**
 * To fetch employees
 * @param {*} req 
 * @param {*} res 
 */
const getEmployees = async function (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = (req.query.search || '').toLowerCase();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const employeesFilePath = path.join(__dirname, '..', 'data', employeeFileName);
        const data1 = fs.readFileSync(employeesFilePath, 'utf-8');
        let employees = JSON.parse(data1);

        const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
        const data2 = fs.readFileSync(coursesFilePath, 'utf-8');
        let courses = JSON.parse(data2);

        for(let employee of employees.root.employee){
            employee['recordes'] = courses.root.records.find((x) => {
                if (employee.delegate_id == x.delegate_id){
                    delete x.records
                    return x;
                }
            })
        }

        employees.root.employee = employees.root.employee
        .map((employee) => {
            const match = courses.root.records.find(x => x.delegate_id === employee.delegate_id);
            if (match) {
                return employee;
            }
            return;
        })
        .filter(Boolean);

        if (search) {
            employees.root.employee = employees.root.employee.filter((e) => {
                const firstName = e.recordes?.first_name?.toLowerCase() || '';
                const lastName = e.recordes?.last_name?.toLowerCase() || '';
                const empId = e.employee_id?.toLowerCase() || '';
                const delId = e.delegate_id?.toLowerCase() || '';
                return (
                    firstName.includes(search) ||
                    lastName.includes(search) ||
                    empId.includes(search) ||
                    delId.includes(search)
                );
            });
        }

        const paginatedEmployees = employees.root.employee.slice(startIndex, endIndex);

        res.status(200).json({
            total: employees.root.employee.length,
            page: page,
            limit: limit,
            employees: paginatedEmployees
        });
    }
        catch (err) {
        console.error('Error reading employees:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * To create employees
 * @param {*} req 
 * @param {*} res 
 */
const createEmployee = (req, res) => {
    const filePath = path.join(__dirname, '..', 'data', employeeFileName);
    const data = fs.readFileSync(filePath, 'utf-8');
    const employees = JSON.parse(data);
    let newEmployee = {  ...req.body };
    employees.root.employee.push(newEmployee);
    fs.writeFileSync(filePath, JSON.stringify(employees, null, 2));
    res.status(201).json(newEmployee);
};

/**
 * To update Employees
 * @param {*} req 
 * @param {*} res 
 */
const updateEmployee = (req, res) => {
    try{
        const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
        const data2 = fs.readFileSync(coursesFilePath, 'utf-8');
        let courses = JSON.parse(data2);
    
        const index = courses.root.records.findIndex(e => e.delegate_id == req.params.id);
        if (index !== -1) {
            courses.root.records[index].first_name = req.body.firstName;
            courses.root.records[index].last_name = req.body.lastName;
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

/**
 * To delete employees
 * @param {*} req 
 * @param {*} res 
 */
const deleteEmployee = (req, res) => {
    try{
        const employeeId = req.params.id;

        console.log(employeeId)

        const employeesFilePath = path.join(__dirname, '..', 'data', employeeFileName);
        const data1 = fs.readFileSync(employeesFilePath, 'utf-8');
        let employees = JSON.parse(data1);
    
        const coursesFilePath = path.join(__dirname, '..', 'data', coursesFileName);
        const data2 = fs.readFileSync(coursesFilePath, 'utf-8');
        let courses = JSON.parse(data2);

        
        const employee = employees.root.employee.find(e => {
            if(e.employee_id == employeeId.toString()) return e
        });
                
        if(!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const delegateId = employee.delegate_id;

        employees.root.employee = employees.root.employee.filter(e => e.employee_id != employeeId);

        courses.root.records = courses.root.records.filter(r => r.delegate_id != delegateId);

        fs.writeFileSync(employeesFilePath, JSON.stringify(employees, null, 2));
        fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2));

        res.status(200).json({ message: 'Employee and learning history deleted successfully' });
    }
    catch (err) {
        console.error('Error deleteing employees:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

router.get('/', getEmployees);
router.post('/', createEmployee);
router.post('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = { router, getEmployees, createEmployee, updateEmployee, deleteEmployee };