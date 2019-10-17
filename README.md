# @adrianhelvik/vdom

[![Build Status](https://travis-ci.org/adrianhelvik/vdom.svg?branch=master)](https://travis-ci.org/adrianhelvik/vdom)
[![Coverage Status](https://coveralls.io/repos/github/adrianhelvik/vdom/badge.svg?branch=master)](https://coveralls.io/github/adrianhelvik/vdom?branch=master)


A virtual DOM library.


## Plan
- [ ] createDiff
  - [ ] diff props
    - [ ] new prop added
    - [ ] existing prop removed
    - [ ] prop retained
  - [ ] diff children
    - [ ] child added
    - [ ] child removed
    - [ ] child key changed
  - [ ] diff nodes
    - [ ] same type & key -> keep
    - [ ] different type -> replace
    - [ ] different key -> replace
    - [ ] key moved -> move node
