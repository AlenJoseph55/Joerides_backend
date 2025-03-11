const { AppError,catchAsync,globalErrorHandler } = require("../utils/errorHandler");
const {prisma,router} = require('../utils/utils')


const GetBicycle = catchAsync(async(req,res)=>{
    const bicycles = await prisma.bicycle.findMany(); 
    res.json(bicycles);  
       
})

// const AddBicycle = catchAsync( async(req,res)=>{
//         // if (req.user.role !== 'admin') {
//         //     throw new AppError(403,'UNAUTHORIZED')
//         //   }
    
//           const bicycle = await prisma.bicycle.create({
//             data: req.body
//           });
//           res.json(bicycle); 
// });

const UpdateBicycle = catchAsync( async (req,res)=>{

  
      const bicycle = await prisma.bicycle.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
      });
  
      res.json(bicycle);
})

const DeleteBicycle = catchAsync(async (req,res)=> {
  
      await prisma.bicycle.delete({
        where: { id: parseInt(req.params.id) }
      });
  
      res.status(204).send();
})

module.exports = {
    GetBicycle,
    // AddBicycle,
    UpdateBicycle,
    DeleteBicycle
}


