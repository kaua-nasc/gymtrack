import { getDataSource } from './typeorm-migration-helper';

const prepareDateSourceForMigration = async () => {
  const dataSource = await getDataSource();
  /**
   * In order to use Nest modules and have just one connection
   * we need to close the connection that nest created so TypeOrm migration manager can create a new one.
   * see https://github.com/typeorm/typeorm/issues/8914#issuecomment-1938005518
   */
  await dataSource.destroy();
  return dataSource;
};

export default prepareDateSourceForMigration();
