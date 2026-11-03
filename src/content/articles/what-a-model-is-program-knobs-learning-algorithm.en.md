---
translationKey: what-is-a-model
lang: en
slug: what-a-model-is-program-knobs-learning-algorithm
title: 'What a model is: a program, its knobs, and the algorithm that sets them'
publishDate: 03-11-2026
tags:
- evaluation
category: lessons
difficulty: 2
sources:
- label: Dive into Deep Learning (d2l.ai), chapter 1 Introduction (parameters define
    the program)
  url: https://d2l.ai/chapter_introduction/index.html
  date: 03-11-2026
- label: Wikipedia, Machine learning (supervised model of inputs and outputs)
  url: https://en.wikipedia.org/wiki/Machine_learning
  date: 03-11-2026
- label: Google Machine Learning Crash Course, Linear regression module (what linear
    regression finds)
  url: https://developers.google.com/machine-learning/crash-course/linear-regression
  date: 03-11-2026
- label: Dive into Deep Learning (d2l.ai), section 3.1 Linear Regression (simplest
    standard tool)
  url: https://d2l.ai/chapter_linear-regression/linear-regression.html
  date: 03-11-2026
contentHash: sha256:3eea60b5eae6358f
publishState: published
---


I think "the model learns from data" is a misleading first sentence to teach, because it hides which program does the choosing. Dive into Deep Learning names two programs: once the parameters are fixed, the program is called a model [s3], and the "meta-program" that uses the dataset to choose those parameters is called a learning algorithm [s4]. By the end of this lesson you will be able to name the parts of a model, say which part training sets, and decide whether a wrong model needs a better search or a different space.

## A program with knobs

The useful mental unit, I think, is a program whose author left some numbers blank. Dive into Deep Learning starts there: we define a flexible program whose behavior is determined by a number of parameters [s1]. It asks you to picture them as knobs you can turn to manipulate what the program does [s2]. Wikipedia starts from the other end. Supervised learning algorithms, it says, build a mathematical model of data that contains both the inputs and the desired outputs [s7]. They learn a function that can predict the output for new inputs [s8].

These are two descriptions of one thing, in my reading: the textbook looks at the knobs, the encyclopedia at the function from inputs to outputs. The picture I would draw joins them. Every setting of the knobs picks out one function, and the shape of the program decides which functions are on the menu at all.

```
             +---------------------------------+
  input x -->|  form:  y = w * x + b           |--> prediction y
             |                                 |
             |  knobs (parameters):  w , b     |
             +---------------------------------+
               set by a person:  the form,
               which inputs it reads (features)
```

Diagram 1: the form and the inputs are chosen before training; the knobs w and b are the only part left open.

## Fix the knobs and you have a model

The word that matters in the textbook's definition is "fixed", and I think it is the most underrated word in machine learning teaching. Making a prediction evaluates a function whose knobs are already set, so nothing about the model changes while it predicts, and nothing changes because the prediction was good or bad.

That is where beginners start crediting the wrong program. Call the frozen function "the learner" and the thing that actually searched for its values drops out of the story.

> [!CONFIRMED]
> Dive into Deep Learning calls the program with fixed parameters a model [s3], and calls the meta-program that uses the dataset to choose those parameters a learning algorithm [s4].

> [!INFERRED]
> I think that is two programs with two jobs. The model only computes; the learning algorithm only searches. A sentence that makes the model the subject of "learns" erases the one that does the searching.

## A second program turns the knobs

Something has to choose the values. Learning, the textbook says, is the process by which we discover the right setting of the knobs for coercing the desired behavior from our model [s5]. Read the next line slowly. As a machine learning algorithm accumulates more experience, its performance improves [s6]. The subject of "improves" there is the algorithm, in my reading, so the textbook itself credits the search.

How does the search know it is improving? It needs a score. Wikipedia frames many learning problems as the minimisation of some loss function on a training set of examples [s9]. The loss expresses the discrepancy between the predictions of the model being trained and the actual instances [s10]. For now, treat the loss as the score the search pushes down; a later lesson covers loss functions.

Not every source keeps the two programs apart. Google's Machine Learning Crash Course says that during training, the model adjusts its bias and weights to minimize the difference between predicted and actual values [s12]. I think a reputable course writes it that way because one subject is shorter than two. I would read it as "training adjusts the model's parameters", and keep the longer version for anyone meeting the idea for the first time.

```
  data (x, y) --> learning algorithm --> loss: how far off? --+
                        ^                                     |
                        |      new values for w, b            |
                        +-------------------------------------+
                        |
                        v  (when the search stops)
                  fixed w, b  ==>  the model
```

Diagram 2: the loop belongs to the learning algorithm; the model is what it leaves behind.

## Linear regression by hand

The example I would trace first is linear regression. Dive into Deep Learning calls it both the simplest and most popular among the standard tools for tackling regression problems [s13].

In an ML context, Google's course says, linear regression finds the relationship between features and a label [s11]. Our feature is x and our label is y. The form is the line from Diagram 1, with two knobs, the weight w and the bias b. The weights determine the influence of each feature on the prediction [s14], so w is the knob that decides how much x matters.

To score a setting we need a loss, and for regression problems the textbook names the squared error as the most common one [s15]. Below, the sum means the squared errors added over all points.

Three made-up points, chosen so the arithmetic fits in your head. Call them Data A:

- The points are (1, 3), (2, 5) and (3, 7).
- Try w = 1, b = 1. The predictions are 2, 3 and 4.
- The errors (prediction minus target) are -1, -2 and -3. Squared, they are 1, 4 and 9, for a sum of 14.
- Now turn one knob to w = 2, keeping b = 1. The predictions are 3, 5 and 7, exactly the targets, and the sum is 0.

The key technique for optimizing nearly every deep learning model, the textbook says, consists of iteratively reducing the error by updating the parameters in the direction that incrementally lowers the loss function [s16]. A later lesson covers how that update is computed. What matters is what stayed still: the form, the feature and the three points. Only a knob moved. A fitting setting existed from the start, so a bad result on Data A is a search failure.

Now a second set, Data B, with the same sign convention:

- The points are (-1, 1), (0, 0) and (1, 1).
- The best straight line is flat: w = 0, b = 2/3, which predicts 2/3 at every point.
- The errors are -1/3, 2/3 and -1/3. Squared, they are 1/9, 4/9 and 1/9, for a sum of 2/3, about 0.67.
- No line does better.

I would stop tuning right here. More points from the same curve, or a longer run, cannot push a line below 2/3, because the points lie on a curve and a line cannot bend.

So change the space. Add a second feature, x squared, and the form becomes y = w * x + v * x^2 + b, with a new knob v. The setting w = 0, v = 1, b = 0 passes through all three points, and the sum is 0. Same data, same kind of search: the new feature enlarged the set of functions the knobs can reach.

## What training never touches

Some values in that setup were never the learning algorithm's to choose. Dive into Deep Learning names two: minibatch size and learning rate are frequently user-defined, and such tunable parameters that are not updated in the training loop are called hyperparameters [s17].

I think the form of the program and the features it reads belong on the same list. In Data B, nothing inside the training loop decided to use a straight line or to read only x. A person made both choices before the first update, and a separate tuning search could have made them too.

This is where I think most introductions blur the line. The label "hyperparameter" says who sets a value; which branch of a repair it belongs to is a separate question. Learning rate and minibatch size change how the search runs. A hyperparameter that sets the form (my example: the degree of a polynomial, or which feature columns get built) changes which behaviors the knobs can reach at all. So I sort each setting by what a change to it does:

| Setting | Who sets it | Changes the search or the space |
| :--- | :--- | :--- |
| Weights and bias | The learning algorithm | Neither: it is the search's output |
| Learning rate, minibatch size | A person or a tuning search | The search |
| Training data | A person | The search |
| Form of the program | A person | The space |
| Features read | A person | The space |
| A hyperparameter that sets the form | A person or a tuning search | The space |

## The case against the split

The strongest objection is practical. Both branches end the same way: a person changes something outside the loop (the data, a learning rate, the form) and trains again. If the repairs look identical, why insist on two names? The shorthand has support too: Google's course writes it that way [s12].

A second objection cuts deeper. You usually cannot answer "could any setting work?" by staring at a model, so the triage question can read as the problem restated. And I think systems that keep updating while they are in use make the word "fixed" look shaky.

On the shorthand, the textbook's own line about the algorithm accumulating experience [s6] already answers it: the course compresses the split.

The repairs look alike, but they differ in how far the fix reaches. A search fix keeps the form and the feature list, then retrains. A space fix changes one of them, then retrains. Data B shows why that matters, because no amount of Data A-style tuning moves a line below 2/3.

Systems that update in use do not break the split. Each update is still the learning algorithm producing a new fixed setting, which the textbook would again call a model [s3] chosen by a learning algorithm [s4]. The split simply runs more often.

I think a model that fits its training points too closely (overfitting) can be pushed from either side, and a later lesson is about generalization.

> [!WARNING]
> Reachability is a question you cannot always answer by looking at the model. Treat it as the first thing to argue about, and expect to test both repairs when the answer is unclear.

## The triage question

When a model is wrong, I ask one question before touching anything: could any setting of its knobs produce the right behavior?

If yes, the search landed badly, as it did on Data A. Change what it learns from or how it runs (the data, the learning rate, the minibatch size), then train again.

If no, as on Data B, no data or search tuning will help until something that defines the space changes: the form, the features, or a hyperparameter that sets them.

The shorthand hides this fork, which is why I would not open a course with it. Ask the question before you collect more data.

## Quiz

<details><summary>Of the weights, the features the model reads, and the learning rate, which does training set?</summary>Only the weights. The features are chosen before training, and the learning rate is a hyperparameter: it shapes how the search runs but is not updated by the training loop.</details>

<details><summary>In Data A, what changed between the setting with a sum of 14 and the setting with a sum of 0, and what stayed the same?</summary>Only w moved, from 1 to 2. The form, the feature and the three points stayed the same, which is why a bad result there is a search failure.</details>

<details><summary>For Data B, would a longer training run or more points from the same curve let a line fit?</summary>No. The best line still leaves a sum of at least 2/3, so the space has to change: adding x squared as a feature lets the model hit all three points.</details>

<details><summary>You raise the learning rate and the loss stops falling. Which branch of the triage is this?</summary>The search. The learning rate controls how the knobs get set, and the set of behaviors they can reach stays the same, so lower it and train again.</details>
