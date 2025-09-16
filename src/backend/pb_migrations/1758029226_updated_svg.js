/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_207831009")

  // update collection data
  unmarshal({
    "name": "svgs"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_207831009")

  // update collection data
  unmarshal({
    "name": "svg"
  }, collection)

  return app.save(collection)
})
