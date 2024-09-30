import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

//Initial Variables
const router = express.Router();
const prisma = new PrismaClient();
//Multer setup
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/images/'); // save uploaded files in 'public/images' folder
    },
    filename: function (req, file,cb){
        const ext = file.originalname.split('.').pop();// get file extension
        const uniquefilename = Date.now() + '-' + Math.round(Math.random() * 1000) + '.' + ext; // generate unique filename - current timestamp + random number between 0 and 1000.
        cb(null, uniquefilename);
    }
});
const upload = multer({ storage: storage});

// Add a new assignment and upload an image
router.post('/create', upload.single('submission'), async (req,res)=>{

    //Expected request criteria
    const submission = req.file ? req.file.filename: null;
    const {className, classProf, assignName, dueDate} = req.body;
    //Validation for empty fields
    if(!className||!classProf||!assignName||!submission){
        return res.status(400).json({ message: 'Required fields must have a value.'});
    }
    try{
        const newAssignment = await prisma.assignment.create({
            data: {
                className: className,
                classProf: classProf,
                assignName: assignName,
                submission: submission,
                dueDate: dueDate
            }
        })
        return res.status(200).json(newAssignment);
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
});
  
// Get a assignment by id
router.get('/read/:id', async (req, res) => {
    const id = req.params.id;
    if(!id||isNaN(id)){
        return res.status(404).json({ message: id+' not found or invalid'});
    }
    // By ID
    try{
        const assignment = await prisma.assignment.findUnique({
            where: {
                id: parseInt(id),
            },
        })
        if(!assignment){
            return res.status(404).json({message: 'assignment not found'})
        }
        res.status(200).json(assignment);
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
});

// Get all assignments
router.get('/all', async (req, res) => {
    try{
        const allAssignments = await prisma.assignment.findMany();
        return res.status(200).json(allAssignments);
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
});

// Update existing assignment information
router.put('/update/:id',upload.single('submission'), async(req,res)=>{
    //Expected request criteria
    const id = req.params.id;
    const {className, classProf, assignName, dueDate} = req.body;
    const submission = req.file ? req.file.filename: null;
    //Validation for empty fields
    if(!id||isNaN(id)){
        return res.status(404).json({ message: id+' not found or invalid'});
    }
    try{
        const oldAssignment = await prisma.assignment.findUnique({
            where:{
                id: parseInt(id),
            }
        })
        if(!oldAssignment){
            return res.status(404).json({ message: id+' not found or invalid'})
        }
        const updatedData = {};
        
        if (className) {
            updatedData.className = className;
        }
        if (classProf) {
            updatedData.classProf = classProf;
        }
        if (assignName) {
            updatedData.assignName = assignName;
        }
        if (dueDate) {
            updatedData.dueDate = dueDate;
        }
        if(submission){
            const oldImagePath = path.join('public/images/', oldAssignment.submission);
            fs.unlink(oldImagePath, (err) =>{
                if (err){
                    return res.status(500).json({message: error.message})
                }
            });
        }
        const updatedAssignment = await prisma.assignment.update({
            where: {
                id: parseInt(id),
            },
            data: updatedData,
        });

        return res.status(200).json(updatedAssignment);
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
});

// Delete selected assignment by ID
router.delete('/delete/:id', async(req,res)=>{
    const id = req.params.id;
    if(!id||isNaN(id)){
        return res.status(404).json({ message: id+' not found or invalid'});
    }
    try{
        const assignment = await prisma.assignment.findUnique({
            where: {
                id: parseInt(id),
            },
        })
        const oldImagePath = path.join('public/images/', assignment.submission);
        await prisma.assignment.delete({
            where: {
                id: parseInt(id),
            },
        })
        fs.unlink(oldImagePath, (err) =>{
        });
        return res.status(200).json({message:'Assignment deleted successfully'})
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
});


export default router;