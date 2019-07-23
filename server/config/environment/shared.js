'use strict';

// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
function arrayUnique(array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) {
        a.splice(j--, 1);
      }
    }
  }
  return a;
}

var subjects = {
  algebra: [
    'addition',
    'subtraction',
    'multiplication',
    'division',
    'linearEquations',
    'quadraticEquations'
  ],
  booleanLogic: ['or', 'and', 'not', 'implication']
};

var aboutData = {
  contributors: [
    {
      name: 'Dr. Chris GauthierDickey',
      email: 'chrisg@cs.du.edu',
      bio: 'Product Owner',
      quarterCont: 'Ongoing',
      image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Dr. Jeffery Edgington',
      email: 'jedgingt@cs.du.edu',
      bio: 'Product Owner',
      quarterCont: 'Ongoing',
      image:
        'https://ritchieschool.du.edu/sites/g/files/lmucqz386/files/JeffreyEdgington_Headshot.jpg'
    },
    {
      name: 'Dr. Daniel Pittman',
      email: 'daniel.pittman@du.edu',
      bio: 'Instructor and Scrum Master',
      quarterCont: 'Ongoing'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Evan Hicks',
      email: 'evan.hicks@du.edu',
      bio: 'UI Team Lead Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Wei Cheng',
      email: 'wei.cheng@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Dalton Crutchfield',
      email: 'dalton.crutchfield@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Eitan Dunn',
      email: 'eitan.dunn@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Josh Hoeg',
      email: 'josh.hoeg@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Amy Karlzen',
      email: 'amy.karlzen@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Grant Kochmann',
      email: 'grant.kochmann@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Shivani Punde',
      email: 'shivani.punde@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Jesse Ruder-Hook',
      email: 'jesse.ruder-hook@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Amarinder Singh Sidhu',
      email: 'amarinder.sidhu@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Terese Specker',
      email: 'terese.specker@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Nick Sundermeyer',
      email: 'nicholas.sundermeyer@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Joseph Wainwright',
      email: 'joseph.wainwright@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Justin Martz',
      email: 'justin.martz@du.edu',
      bio: 'Server Team Lead Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Zachary Burmeister',
      email: 'zachary.burmeister@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.example.com/path/to/image'
    },
    {
      name: 'Madison Eaton',
      email: 'madison.eaton@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Andres Espineira',
      email: 'andres.espineira@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Tresdon Jones',
      email: 'tresdon.jones@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Simao Nziaka',
      email: 'simao.nziaka@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.cs.du.edu/~chrisg/images/profile.jpg'
    },
    {
      name: 'Avery Sand',
      email: 'avery.sand@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Tyler Stanley',
      email: 'paul.stanley@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Michael Stephens',
      email: 'michael.stephens@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.example.com/path/to/image'
    },
    {
      name: 'Anh Tran',
      email: 'anh.tran@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Winter 2018'
      //image: 'http://www.example.com/path/to/image'
    },
    {
      name: 'Peter Valesares',
      email: 'peter.valesares@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Kevin Zheng',
      email: 'kevin.zheng@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2018'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'John Pavlovich',
      email: 'john.pavlovich@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2019'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Lombe Chileshe',
      email: 'lombe.chileshe@du.edu',
      bio: 'Server Team Developer',
      quarterCont: 'Spring 2019'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Isaac Nelson',
      email: 'issac.nelson@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2019'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Lance Shuey',
      email: 'burton.shuey@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2019'
      //image: 'http://www.example.com/route/to/image'
    },
    {
      name: 'Mallory Chin',
      email: 'mallory.chin@du.edu',
      bio: 'UI Team Developer',
      quarterCont: 'Spring 2019'
      //image: 'http://www.example.com/route/to/image'
    }
  ],
  description:
    "This project was developed as part of Dr. Daniel Pittman's Web Development Projects course" +
    'in Winter Quarter 2018. The goal of the this MVP (minimum viable product) is a rich and responsive' +
    "web application for Dr. GauthierDickey's research into problem creation and generation for educational purposes."
};

exports = module.exports = {
  // List of user roles
  userRoles: ['guest', 'user', 'student', 'teacher', 'researcher', 'admin'],
  subjects: subjects,
  aboutData: aboutData
};
