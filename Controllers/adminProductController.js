import {product} from "../Config/Mongodb.js";


export const addProduct=async(req,res)=>{
    try{
        const {productName,productRate,isAvailable}=req.body;
        if(!productName){
            return res.status(400).json({success:false,message:"Product Name is required"});
        }
        if(!productRate){
            return res.status(400).json({success:false,message:"Product Rate is Required"});
        }
        
        const isExisting=await product.findOne({productName});
        if(isExisting){
            return res.status(400).json({success:false,message:"Product Already Exists"});
        }
        const CreateProduct=new product({
            productName,
            productRate,
            isAvailable
        })

        await CreateProduct.save();
        return res.status(200).json({success:true,message:"Product Added Successfully"});

    }
    catch(err){
        console.log(err)
        return res.status(400).json({message:err.message})
    }
}
export const getProduct=async(req,res)=>{
    try{

        const isproduct =await product.find();
        if(!isproduct){
            return res.status(400).json({success:false,message:"Product Not Found"});
        }
        if(isproduct.length==0){
            return res.status(200).json({success:false,message:"No Product Found"});
        }
        res.json(isproduct);
    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})

    }
}
export const updateProduct=async(req,res)=>{
    try{

        const{productRate,isAvailable}=req.body;
        const {id}=req.params;
        if(!productRate){
            return res.status(400).json({success:false,message:"Product Rate is Required"});
        }
         if( isAvailable==undefined){
            return res.status(400).json({success:false,message:"Availability is Required"});
        }
        const isExisting=await product.findById(id);
        if(!isExisting){
            return res.status(400).json({success:false,message:"product Not Found"});
        }
        await product.findByIdAndUpdate(id,
          {$set:{productRate,isAvailable}},
        {new:true});
        return res.status(200).json({success:true,message:"Product Updated Successfully"});

    }
    catch(err){
        return res.status(400).json({success:false,message:err.message})
    }
}
export const deleteProduct=async(req,res)=>{
    try{
        const {id}=req.params;
        if(!id){
            return res.status(400).json({success:false,message:"Product Id is Required"});
        }
        await product.findByIdAndDelete(id);
        return res.status(200).json({success:true,message:"Product Deleted Successfully"});

    }
    catch(err){
        return res.status(400).json({success:false,message:err.message});
    }
}