# All Goblins Have Names

A module for Foundry VTT. Allows you to use a table as the Display Name for a token so each new
token will get a random name.

## How to use it

First, grab your random name table and drag it into a Journal entry. That will give you some
text that looks similar to `@RollTable[2cbm3cP46dxcxO5Z]{Dwarf Female Name}`. Now, open the Actor
and click Prototype Token. Paste your `@RollTable[...` text into the Token Name. When you drag your Actor
onto the map to create a new Token, its name will be randomized!

### Return more than one result for firstname + lastname

When multiple lines are returned from a table, the lines will be joined together with a space. For example, you could have a roll table formula of 1d1, and have two results which are also tables for a firstname and a lastname, both with range 1-1.

![A RollTable that returns multiple lines on the same dice roll, for firstname and lastname](./example.png)

## Installation

You can install this module through the Foundry module UI

## Get help

You can [file an issue](https://github.com/jsabol/all-goblins-have-names/issues/new) on github if
you're running into a bug or reach me on the Foundry VTT discord as Cattegy#7436.
