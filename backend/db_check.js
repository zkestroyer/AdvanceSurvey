const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    console.log('Connected!\n');

    // 1. Check remote .env DATABASE_URL
    console.log('=== Remote .env ===');
    const env = await ssh.execCommand('cat /applications/atsolar_backend/.env');
    console.log(env.stdout);

    // 2. Check remote prisma schema
    console.log('\n=== Remote prisma schema (datasource) ===');
    const schema = await ssh.execCommand('head -20 /applications/atsolar_backend/prisma/schema.prisma');
    console.log(schema.stdout);

    // 3. List all databases on MySQL
    console.log('\n=== All MySQL databases ===');
    const dbs = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe -e "SHOW DATABASES;"');
    console.log(dbs.stdout);

    // 4. Check tables in atsolar_db
    console.log('\n=== Tables in atsolar_db ===');
    const tables1 = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SHOW TABLES;" 2>/dev/null');
    console.log(tables1.stdout || '(database does not exist or no tables)');

    // 5. Check tables in atsolar (if exists)
    console.log('\n=== Tables in atsolar ===');
    const tables2 = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar -e "SHOW TABLES;" 2>/dev/null');
    console.log(tables2.stdout || '(database does not exist or no tables)');
    if (tables2.stderr) console.log('ERR:', tables2.stderr);

    // 6. Check row counts in the active database
    console.log('\n=== Row counts in atsolar_db ===');
    const counts = await ssh.execCommand(`mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "
      SELECT 'User' as tbl, COUNT(*) as cnt FROM User
      UNION ALL SELECT 'Shop', COUNT(*) FROM Shop
      UNION ALL SELECT 'SurveyTemplate', COUNT(*) FROM SurveyTemplate
      UNION ALL SELECT 'SurveyResponse', COUNT(*) FROM SurveyResponse
      UNION ALL SELECT 'SurveyAnswer', COUNT(*) FROM SurveyAnswer
      UNION ALL SELECT 'Territory', COUNT(*) FROM Territory
      UNION ALL SELECT 'Role', COUNT(*) FROM Role
      UNION ALL SELECT 'Product', COUNT(*) FROM Product
      UNION ALL SELECT 'CheckIn', COUNT(*) FROM CheckIn;
    " 2>/dev/null`);
    console.log(counts.stdout || '(failed)');

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
