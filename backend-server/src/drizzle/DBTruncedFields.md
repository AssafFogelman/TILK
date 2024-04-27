{
severity_local: 'NOTICE',
severity: 'NOTICE',
code: '42622',
message: 'identifier "tag_templates_tag_category_tag_template_categories_tag_template_category_id_fk" will be truncated to "tag_templates_tag_category_tag_template_categories_tag_template"',
where: 'compilation of PL/pgSQL function "inline_code_block" near line 1',
file: 'scansup.c',
line: '99',
routine: 'truncate_identifier'
}
{
severity_local: 'NOTICE',
severity: 'NOTICE',
code: '42622',
message: 'identifier "tag_templates_tag_category_tag_template_categories_tag_template_category_id_fk" will be truncated to "tag_templates_tag_category_tag_template_categories_tag_template"',
position: '15',
file: 'scansup.c',
line: '99',
routine: 'truncate_identifier'
}
{
severity_local: 'NOTICE',
severity: 'NOTICE',
code: '42622',
message: 'identifier "tag_templates_tag_category_tag_template_categories_tag_template_category_id_fk" will be truncated to "tag_templates_tag_category_tag_template_categories_tag_template"',
where: 'SQL statement "ALTER TABLE "tag_templates" ADD CONSTRAINT "tag_templates_tag_category_tag_template_categories_tag_template_category_id_fk" FOREIGN KEY ("tag_category") REFERENCES "tag_template_categories"("tag_template_category_id") ON DELETE no action ON UPDATE no action"\n' +
'PL/pgSQL function inline_code_block line 2 at SQL statement',
file: 'scansup.c',
line: '99',
routine: 'truncate_identifier'
}
