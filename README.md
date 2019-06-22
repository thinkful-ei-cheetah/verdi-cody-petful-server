# Petful-server
This is a server created by Cody Gillette and Michael Verdi for our pet adoption app.


The client's README should reflect the introduction present in your app, and link to the live app.
Include screenshots if you can!
This application alows users to fill out a form to start adopting the new pet of there dreams!
once you sign in you will be placed into a queue and wait your turn to chose the newest member of you family.
 # live link
 https://petful.cgillette12.now.sh/

# api service 
The server's README should explain how other developers would consume (or use) your API, and provide example requests and responses.

 When you using this api you have diffent methods 'GET / POST / DELETE

"https://api.petfinder.com/v2"


GET
/api/adoptions 
/api/adoptions/dogs or /api/adoptions/cats

return {
    gender,
    size,
    name,
    description,
    photo
  };

  /api/users

POST 
return {
  full_name,
  email,
  zipcode,
}

DELETE{
  dog,
  cat,
}

Both READMEs should also explain the tech stacks used in the repo, for the benefit of developers who might want to work on your project.
UTILIZES a in memory QUEUE DATA structure
REACT NODE EXPRESS 

