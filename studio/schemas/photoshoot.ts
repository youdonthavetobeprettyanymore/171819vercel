import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'photoshoot',
  title: 'Photoshoot',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required(),
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'thumbnails',
      title: 'Thumbnails',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'info',
              type: 'string',
              title: 'Info',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'photoshootTitle',
      title: 'Photoshoot Title',
      type: 'string',
    }),
    defineField({
      name: 'photoshootDate',
      title: 'Photoshoot Date',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'photoshootInfo',
      title: 'Photoshoot Info',
      type: 'string',
    }),
  ],
})
