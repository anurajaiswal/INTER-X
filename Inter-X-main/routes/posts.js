const express=require('express')
const router=express.Router()
const {ensureAuth}= require('../middleware/auth')
const Post=require('../models/Post')
//@desc show add page
// @route GET /posts/add 
router.get('/add',ensureAuth,(req,res)=>{
    res.render('posts/add')
})

//@desc process add form
// @route POST /posts 
router.post('/',ensureAuth, async(req,res)=>{
    try{
        req.body.user=req.user.id
        await Post.create(req.body)
        res.redirect('/dashboard')
    }
    catch(err){
        console.error(err)
        res.render('error/500')
    }
    res.render('posts/add')
})

//@desc show all posts
// @route GET /posts/ 
router.get('/',ensureAuth,async (req,res)=>{
    try{
        const posts=await Post.find({status: 'public'})
            .populate('user')
            .sort({createdAt: 'desc'})
            .lean()

        res.render('posts/index',{
            posts,
        })

    }
    catch(err){
        console.error(err)
        res.render('error/500')
    }
})

//@desc show single post
// @route GET /posts/:id 
router.get('/:id',ensureAuth, async(req,res)=>{
    try {
        let post=await Post.findById(req.params.id)
        .populate('user')
        .lean()
        if(!post){
            return res.render('error/404')
        }
        res.render('posts/show',{
            post
        })
    } catch (error) {
        console.error(err)
        res.render('error/404')
    }
})

//@desc show edit page
// @route GET /posts/edit/:id 
router.get('/edit/:id',ensureAuth,async (req,res)=>{
    try {
        const post=await Post.findOne({
            _id: req.params.id
        }).lean() 
        if(!post){
            return res.render('error/404')
        }
        if(post.user!=req.user.id){
            res.redirect('/posts')
        }else{
            res.render('posts/edit',{
                post,
            })
        }
    } catch (error) {
        console.error(err)
        return res.redirect('/error/500')
    }
    
})

//@desc update edit page
// @route GET /posts/:id
router.get('/:id',ensureAuth, async (req,res)=>{
    try {
        let post=await Post.findById(req.params.id).lean()
        if(!post){
            return res.render('error/404')
        }
        if(post.user!=req.user.id){
            res.redirect('/posts')
        }else{
            post=await Post.findOneAndUpdate({_id: req.params.id}, req.body,{
                new: true,
                runValidators: true
            })
            res.redirect('/dashboard')
        }
    
    } catch (error) {
        console.error(err)
        return res.redirect('/error/500')
    }
    
})

//@desc show add page
// @route GET /posts/add 
router.delete('/:id',ensureAuth,async(req,res)=>{
    try{
        await Post.remove({_id: req.params.id})
        res.redirect('/dashboard')
    }
    catch(err){
        console.error(err)
        return res.redirect('/error/500')
    }
})

//@desc user posts
// @route GET /posts/user/:userId 
router.get('/user/:userId',ensureAuth,async(req,res)=>{
    try {
        const posts=await Post.find({
            user:req.params.userId,
            status:'public'
        })
        .populate('user')
        .lean()
        res.render('posts/index',{
            posts
        })
    } catch (err) {
        console.error(err);
        res.redirect('error/500 ')
    }
})

module.exports=router