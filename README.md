# Pixel-Perfect-Backend
Product Routes


# /api/products

get - no params

post - no params - body {
    name :string,
    description:string,
    price:number,
    category:ObjectID(category),
    inStock:boolean,
    image:file,
    otherImage:file
} - multipart/form-data

put = params id - body {
    name:string,
    description:string,
    price: number,
    category: ObjectId(category),
    inStock:boolean
}


# /api/categories

get - no params - query {
    populate: boolean
}

post - no params - body {
    name:string,
    description:string,
} - json/form-data , x-www-encoded

get - params :id - query {
    populate: boolean
}