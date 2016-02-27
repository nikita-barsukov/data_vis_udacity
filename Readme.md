Summary
=====

This project is a grading project for a course 'Make Effective Data Visualization', a part of Udacity's nanodegree. I chose dataset with Loan Data from Prosper, which is given in the list of datasets in instructions to grading project. Focus of the writeup is to explore relation between median interest rate in a state and share of bad loans. The writeup is available on separate page, http://nikita-barsukov.github.io/data_vis_udacity/ 

Design
=======

The raw data file from Udacity is 82MB, which contins data of individual loans. I used R scripts to aggregate data on state level and to generate encessary CSV files that I used for my visualizations. These scripts are part of that repository.

I decided to create a narrative story, not just a single visualization. This will let me tell my findings in a clearer way.

I did not use any Javascript framwork, like Backbone, or React, to organize my code. I simply splitted into several functions, each of these functions draws single visualization. Other choices of front-end libraries are very straightforward: d3.js for data visualization, Bootstrap 3 for layout.

Feedback
=======

Feedback about my visualization is collected on Udacity's discusion forum: https://discussions.udacity.com/t/feedback-on-grading-project-loan-data-from-prosper/158813 


Resources
=======

Full list of resources used in this project are given in separate file [Sources.md](https://github.com/nikita-barsukov/data_vis_udacity/blob/master/Sources.md)
