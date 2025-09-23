/// <reference path="../../utils/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_207831009")

  // update collection data
  unmarshal({
    "name": "Svg"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_207831009")

  // update collection data
  unmarshal({
    "name": "svgs"
  }, collection)

  return app.save(collection)
})
