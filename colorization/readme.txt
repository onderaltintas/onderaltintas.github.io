written by Önder ALTINTAŞ in 2016
web worker added in 2019

Q: Why no prototyping?
A: For better readability. Noone will create more than 1 IDWManager anyways. I liek public/private seperation.
Honestly, I wasn't using prototyping@2015 then felt so lazy to change this one. 

Q: Complexity increases with parameters.
A: In implemented production use case, when parameters creates higher complexity, 
the application automatically calculates the complexity and reduces the resolution to acceptable rate.

Q: Algorithm?
A: Comes from Darren Wiens' blog post.(https://darrenwiens.wordpress.com/tag/inverse-distance-weighting/)
