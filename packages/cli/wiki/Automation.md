# barnard59 - Automating pipelines

There is lots of RDF data published as one can see in the [Linked Open Data Cloud Diagram](https://lod-cloud.net/). Unfortunately a lot of this data was a one-time effort by a research project or an individual and is not kept up to date. One of the design goals of barnard59 is to simplify automation so RDF data can be kept up to date with little to no effort, at least as long as the data source stays stable.

Culture-wise it is similar to the [DevOps](https://en.m.wikipedia.org/wiki/DevOps) concept in programming, we simply apply some of the principles for data pipelines and use CI/CD tools for automating delivery of RDF data.

## Basics & Prerequisite

Like code, we maintain the pipeline within a version control system like Git. This makes it easy to try out things by working in branches & you will get a full history of what you do in case you break something at one point. We usually do that in public GitHub repositories or from private data in private GitLab instances of our customers. So before you go any further, do a `git init` and add whatever you did so far.

To be able to automate something we typically start working on our workstation. We continue the work we did in the [Primer](Primer). Running the pipeline locally is a good start as it facilitates developing and debugging in case something goes wrong. If you have a really large dataset it usually makes sense to work on a smaller version of the data, this makes it easier to verify and extend the mapping as you go.

Most likely you will read the source data from a local directory on your workstation so we do not have an overhead of downloading the data from an external source each time we run the pipeline. You can do that by adding steps that reads from the local filesystem and write the result to a file.

To run the pipeline in an automated way we usually fetch the data from a data source as a first step. Talk to whoever provides the data and see how they or you can automate delivery of the input data. This could be anything that can be accessed in the barnard59 pipelines, we worked with [ftp, sftp](https://github.com/zazuko/barnard59-ftp/), WebDAV and simple [http](https://github.com/zazuko/barnard59-http) resources so far (including plain WebDAV resources and S3 buckets).

If you can't find a source for your data you might also consider using a generic cloud-sync tool like [rclone](https://github.com/zazuko/barnard59-ftp/), this is what we use for WebDAV when accessing a single HTTP WebDAV resource is not enough. What we do in this case is running `rclone` before we start the pipeline and let it write to the directory we declare as data source in our pipeline.

Once you have access to the data implement an according step in your pipeline and test it. The output can still go to a file but alternatively you might want to write directly to a SPARQL endpoint using the [SPARQL Graph Store Protocol](https://github.com/zazuko/barnard59-graph-store).

To summarize, you will:

* Use some form of version control
* Have a running pipeline on your local workstation.
* Be able to fetch data from an external resource so we can run it in a CI/CD environment.
* Write the result either to a file or to a SPARQL endpoint using the SPARQL Graph Store protocol.

## Dockerize the pipeline

Once the pipeline is running locally we can prepare to run it in a docker container. This is the first step for running this container in a CI/CD environment later. If you are fluent in Docker you might want to use your own container image. If you don't want to go the extra mile you can use [a container we developed](https://github.com/zazukoians/docker-node-java-jena) for working with barnard59 pipelines. Among others, it provides

* A full Node.js environment, in fact the [base of the container](https://github.com/zazukoians/docker-node-java) is the official `node` image.
* We add Java 11 JRE to the image as many of the RDF tooling is using Java and we might need that in the pipeline at some point.
* In particular we add the [Apache Jena](https://github.com/zazukoians/docker-node-java-jena) stack, which gives you a file-based [TDB](https://jena.apache.org/documentation/tdb/index.html) implementation & a bunch of nice command-line tooling for working with and validating RDF data.
* A bunch of additional command-line utils like [git](https://git-scm.com/), [serd](https://drobilla.net/software/serd), [rapper](http://librdf.org/) and [rclone](https://rclone.org/).

Make sure you have a running Docker-environment like [Docker-Desktop](https://www.docker.com/products/docker-desktop) on your system and then run:

    docker pull zazukoians/node-java-jena

Now you can run an instance on your system:

    docker run -ti zazukoians/node-java-jena /bin/bash

This should give you a promt like this:

    root@2b0bc8c3a58a:/rdf#

Now you will have to get your git repository with the pipeline in there. If you can't access it via web you might also mount a local directory into the container by using [Docker bind mounts](https://docs.docker.com/storage/bind-mounts/). Once your pipeline code is in there, change your working directory to it.

The process now is the same as when you would work locally, you have to:

* Run `npm install` to get all the dependencies installed.
* Run `npm start` or whatever run-script you defined.
* Sit back and relax.

If everything went right, your pipeline did what it had to do, like writing data in a file in the docker container or post it towards a SPARQL endpoint. Make sure everything looks right & fix if it does not.

Now it is time to move to the last step.

## Run the pipeline within a CI/CD environment

Now we know that our pipeline not only works on our local workstation but also in a dockerized environment in a generic Linux image. This is all we need to automate the whole process for good. As mentioned before, we use CI/CD principles to automate it. In our example we use a GitLab CI/CD pipeline but barnard59 pipelines are in no way restricted or depending on [GitLab CI](https://docs.gitlab.com/ee/ci/). Other CI/CD solutions might work as well or better, just use what you are used to.

In a CI/CD we usually have to

* Put all username & passwords in environment variables. If you committed something into your git directly, start from scratch. You DO NOT want to have anything password related in a version control system.
* This means you might have to adjust the barnard59 pipeline to get some parameters from GitLab [environment variables](https://docs.gitlab.com/ee/ci/variables/), see the [barnard59 docs](https://github.com/zazuko/barnard59/blob/master/README.md#definition-via-command-line-arguments) about how to do that.
* Create some kind of definition about a CI/CD pipeline. In GitLab this is also called pipeline and this CI/CD pipeline will execute our barnard59 pipeline.

In GitLab we need a `.gitlab-ci.yml` file in the root directory of your GitLab repository. A minimal configuration for running our pipeline looks like this:

```yaml
image: zazukoians/node-java-jena
before_script:
  - npm install

stages:
  - build

pipeline_build:
  stage: build
  script:
    - npm run start
```

If you have CI/CD enabled on your pipeline GitLab should directly execute a pipeline once you commit this file and push it to the repository. And if everything was well tested before, your pipeline should run through without issues!

Note that by definition a CI/CD process is completely nuked at the end so if you wrote data to a file, it will be gone unless you tell your configuration to make this file available. In GitLab this is called [artifacts](https://docs.gitlab.com/ce/ci/yaml/README.html#artifacts), an extended version of the configuration that makes the N-Triples available might look like this:

```yaml
image: zazukoians/node-java-jena
before_script:
  - npm install

stages:
  - build

pipeline_build:
  stage: build
  script:
    - npm run start
  artifacts:
    paths:
      - target/everything.nt
    expire_in: 1 day
```

This would expect a N-Triples file in `target/everything.nt` and make this available for download for 1 day.

And with that we end this tutorial. You can use this as a base and build more powerful and complex pipelines. If you want to automate your pipeline in GitLab you have multiple options, one of them is creating a cron-job like schedule that will execute your pipeline, see the [GitLab documentation](https://docs.gitlab.com/ce/user/project/pipelines/schedules.html) for more information.


