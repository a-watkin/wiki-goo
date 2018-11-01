# Wiki-goo

Wiki-goo is a mash up of the wikipedia and google maps APIs. Given an address it returns a marker for that address and wikipedia articles related to that area so you can discover interesting things connected to that area.

[Bootsrap](https://getbootstrap.com/) has been used for basic styling and [Bootstrap Toggle](http://www.bootstraptoggle.com/) toggle for sliding buttons.

![Example usage](https://raw.githubusercontent.com/a-watkin/wiki-goo/master/wiki-goo-example.png)

Javascript and jQuery is used to join the APIs together.

## Usage and features

Map markers of the geographical location of wikipedia pages are displayed on the map. Clicking on them will open an information box with a link to the article.

The relevant wikipedia articles are also displayed to the side of the map or below it depending on the page width.

A distance from the chosen search location can also be overlaid on the map, this is to simulate walking distance to a local feature of interest.

Click search, toggling click search allows for clicking on any part of the map and setting that as the new location. Information about that location can then be found even if the address is not known. The local area can be explored in this way.

[You can see a live version of the project here](http://adevwatkin.com/wiki-goo/)
