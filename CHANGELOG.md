## [1.4.1](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.4.0...v1.4.1) (2026-09-21)


### Bug Fixes

* **ci:** pin the promotion workflow past the conventions repair ([#34](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/34)) ([8e1c174](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/8e1c17459a525a23730432998b18c08d6693054f)), closes [#191](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/191) [#192](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/192) [#193](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/193) [#195](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/195) [#196](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/196) [#198](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/198) [MicroTodoSuite/microservice-app-gitops#205](https://github.com/MicroTodoSuite/microservice-app-gitops/issues/205)

# [1.4.0](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.3.1...v1.4.0) (2026-09-15)


### Features

* **metrics:** count nginx responses by status code ([7e552d4](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/7e552d4aa362fe18585522e6b03a0d000346f807))
* **metrics:** count nginx responses by status code ([#33](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/33)) ([48f0981](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/48f0981e80d1608332861eee6d93179ab6a9add9)), closes [gitops#194](https://github.com/gitops/issues/194)

## [1.3.1](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.3.0...v1.3.1) (2026-09-14)


### Bug Fixes

* **ci:** repoint to the latest .github reusable workflow refs ([#30](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/30)) ([3a9f1c2](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/3a9f1c2ae2cf3506aa40bfdadbdad1009e59de04)), closes [#142](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/142) [#19](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/19)

# [1.3.0](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.2.0...v1.3.0) (2026-09-13)


### Features

* **tracing:** trace the frontend entry point through opentelemetry ([#27](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/27)) ([95818c7](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/95818c7470339e7748e4c29b447bbd483b7511a3)), closes [MicroTodoSuite/microservice-app-todos-api#22](https://github.com/MicroTodoSuite/microservice-app-todos-api/issues/22) [MicroTodoSuite/microservice-app-log-message-processor#23](https://github.com/MicroTodoSuite/microservice-app-log-message-processor/issues/23) [#123](https://github.com/MicroTodoSuite/microservice-app-frontend/issues/123)

# [1.2.0](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.5...v1.2.0) (2026-09-09)


### Bug Fixes

* **ci:** target replacement AWS account ([5f0b730](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/5f0b73055ed1b9487b7d27cc252250644c73f000))
* **security:** update vulnerable Alpine packages ([6dca807](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/6dca807f65db3d94e19505f9063de12e9cab7fe5))
* **us3:** remediate frontend runtime CVE ([4eb7066](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/4eb7066eec61b8a2d419cfdc6f9e465ff2bd92df))


### Features

* **us3:** implement frontend operational contract ([8369436](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/836943664766d86f8f73ec746c40c1480bd9dcf0))

## [1.1.5](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.4...v1.1.5) (2026-08-24)


### Bug Fixes

* restrict nginx_status to localhost only ([c1cecdb](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/c1cecdbca07d3a03465781edb4449b17f31e6e02))

## [1.1.4](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.3...v1.1.4) (2026-08-24)


### Bug Fixes

* **ci:** publish images to the migrated AWS account ([72c12c8](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/72c12c8fe66a411f4ed3a1747559e0f7e73d66ff))

## [1.1.3](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.2...v1.1.3) (2026-08-19)


### Bug Fixes

* defer backend DNS resolution ([d2d28c5](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/d2d28c529abf1d803bdd2f83084d48832cab1ac2))
* use numeric runtime identity ([f316b58](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/f316b58942a4804ad704794d25a22c58a44f2fd9))

## [1.1.2](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.1...v1.1.2) (2025-04-25)


### Bug Fixes

* test ([832e504](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/832e5044b79ce79b4b64e4ba2603cbcb771b3d04))

## [1.1.1](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.1.0...v1.1.1) (2025-04-25)


### Bug Fixes

* **pipeline:** update condition of pipeline ([2c60870](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/2c60870a78fbf4c6f6a8c56f0d21f9df6b3f4579))

# [1.1.0](https://github.com/MicroTodoSuite/microservice-app-frontend/compare/v1.0.0...v1.1.0) (2025-04-25)


### Bug Fixes

* correction to the deployment pipeline ([aa9373b](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/aa9373b14aed0c6583de83f6ed13a17f7b4f1e82))
* development pipeline corrected ([6e96880](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/6e9688098b2b00fd7972646a46f5cb1edcb3cb58))
* nav corrected ([f9df75f](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/f9df75f0bd9a925459543d4aec08b4b6cee9becc))
* **debug:** debug pipeline ([3572f2f](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/3572f2f47951a3babf8c7c030aa65500f3ffa6c9))
* remove debug pipeline ([8879be3](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/8879be3372ce989adb2efc20354ecce408f4a3d6))
* typo corrected ([cd970f6](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/cd970f63fdb91711bdaf84ae8c5c45763b8af783))
* update pipeline ([81b420b](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/81b420b45c3becf1c14a7f9c0c9422bafc94b445))
* update pipeline of development ([abd9332](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/abd93328c902dcc3e9ccd09eedb5b501fc29791b))
* update pipeline of development ([4041d60](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/4041d60c6445f2afba456df77fef8e75469b6994))
* update pipeline with variables of env ([981bd90](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/981bd90361b642463e712de1379924ce68b0212e))


### Features

* modified pipeline to handle versioning on published frontend images ([eb6920f](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/eb6920f561bbd0b6374a17f47544679ce8063ba7))

# 1.0.0 (2025-04-25)


### Bug Fixes

* **pipeline:** update pipeline ([42a2b62](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/42a2b62248f78f940de2b9383b95079e6fe71f40))
* corrected the semantic release pipeline to use the correct version of node ([768af7d](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/768af7d17549b557fa400f6e29ba645a4f3a9797))
* correction in the dependencies used by the semantic release pipeline ([7c6b6c4](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/7c6b6c4a345b69f20203cc33f00602e4090f1c01))
* correction of dependencies used by semantic release ([ac7c30c](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/ac7c30c41d5bf79358be6c68c258c252b4b71647))
* correction of the ubuntu version used by the semantic release pipeline ([9f1a0a5](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/9f1a0a57b2dc152f2ffa02d94b40101ebb150530))


### Features

* add microservice for frontend ([6c2a2f8](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/6c2a2f8e964dad8530a7a7015849b1a90e281ab1))
* **pipeline:** add pipeline of development ([56edfb5](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/56edfb558d8657213155e97d31f6498aa58f2721))
* add semantic release pipeline ([6c65439](https://github.com/MicroTodoSuite/microservice-app-frontend/commit/6c654393e368e8d3f497af12717b593ed4d64655))
