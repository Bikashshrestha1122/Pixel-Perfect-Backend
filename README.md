# Pixel-Perfect-Backend

## Product Routes
### /api/products
```
post - no params - body {
    name :string,
    description:string,
    price:number,
    category:ObjectID(category),
    inStock:boolean,
    image:file,
    otherImage:file
} - multipart/form-data
 
get - no params - query{
    populate: boolean
}

get - params :id - query{
    populate:boolean
}

put - params :id - body {
    name:string,
    description:string,
    price: number,
    category: ObjectId(category),
    inStock:boolean
}

delete - params :id
```
## Category Routes
### /api/categories
```
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
```



## Login Routes
### /api/auth/login

```
post - no params - no query - body{
    username: string,
    password:string
}
 ```


