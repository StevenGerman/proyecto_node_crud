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

//Actualizar un libro por su ID [PUT]
router.put('/:id', getBook, async (req, res) =>{
    try {
        const book = res.book;
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.genre = req.body.genre || book.genre;
        book.publication_date = req.body.publication_date || book.publication_date;
        const updateBook = await book.save();
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({message: error.message})
    }
    
})
//Actualizar parcialmente un libro por su ID
router.patch('/:id', getBook, async(req,res) => {
    if(!req.body.title && !req.body.author && !req.body.genre && !req.body.publication_date){
        return res.status(400).json({message: "Se requiere al menos un campo 'title, 'author' o 'genre' para actualizar."});
    }

    if(req.body.title != null) {
        res.book.title = req.body.title;
    }
    if(req.body.author != null) {
        res.book.author = req.body.author;
    }
    if(req.body.genre != null) {
        res.book.genre = req.body.genre;
    }
    if(req.body.publication_date != null) {
        res.book.publication_date = req.body.publication_date;
    }
    try {
        const updateBook = await res.book.save();
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({message: error.message});
    }
})

router.delete('/:id', getBook, async (req,res) => {
    try {
        await res.book.deleteOne();
        res.json({message: 'Libro eliminado'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});




module.exports = router