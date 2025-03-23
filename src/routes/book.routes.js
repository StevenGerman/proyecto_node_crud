const express = require('express')
const router = express.Router()
const Book = require('../models/book.model')

//middleware
const getBook = async (req, res, next) => {
    let book;
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({
            message: 'El ID del libro no es válido'
        })
    }
    try {
        book = await Book.findById(id)
        if (!book) {
            return res.status(404).json(
                {
                    messsage: 'El libro no fue encontrado'
                }
            )
        }
    } catch (error) {
        return res.status(500).json(
            {
                message: error.message
            }

        )
    }
    res.book = book;
    next()
}


//Obtener todos los libros[GET ALL]
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        console.log('GET ALL', books)
        if (books.length === 0) {
            res.status(204).json([])
        }
        res.json(books)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//GET FOR ID
router.get('/:id', getBook, async (req, res) =>{
    try {
        res.json(res.book);
    } catch (error) {
        res.status(400).json({message: error.message})
    }
    
})

//Crar un nuevo libro (recurso) [POST]

router.post('/', async (req, res) => {
    const { title, author, genre, publication_date } = req?.body
    if (!title || !author || !genre || !publication_date) {
        return res.status(400).json({
            massage: 'Los campos título, autor, género y fecha son obligatorios'
        })
    }

    const book = new Book(
        {
            title: title,
            author: author,
            genre: genre,
            publication_date: publication_date
        }
    )

    try {
        const newBook = await book.save()
        res.status(201).json(newBook)
        console.log(newBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }

})




module.exports = router