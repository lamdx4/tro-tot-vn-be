import { DataSource } from 'typeorm'

export async function setupFullText(ds: DataSource) {
  await ds.query(`
    IF NOT EXISTS (
      SELECT * FROM sys.fulltext_catalogs WHERE name = 'PostCatalog'
    )
    BEGIN
      CREATE FULLTEXT CATALOG PostCatalog AS DEFAULT;
    END
  `)

  await ds.query(`
    IF NOT EXISTS (
      SELECT * FROM sys.fulltext_indexes fi
      JOIN sys.objects o ON fi.object_id = o.object_id
      WHERE o.name = 'Post'
    )
    BEGIN
      CREATE FULLTEXT INDEX ON Post (
        title LANGUAGE 1066,
        description LANGUAGE 1066,
        street LANGUAGE 1066,
        ward LANGUAGE 1066,
        district LANGUAGE 1066,
        city LANGUAGE 1066
      )
      KEY INDEX PK_Post
      ON PostCatalog;
    END
  `)
  console.log('Fulltext index created')
}
