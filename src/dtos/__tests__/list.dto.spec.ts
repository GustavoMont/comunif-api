import { User } from 'src/models/User';
import { ListResponse } from '../list.dto';
import { arrayGenerator, userGenerator } from 'src/utils/generators';

describe('List Response Dto', () => {
  it('should return more than one page', () => {
    const users = arrayGenerator(10, userGenerator);
    const response = new ListResponse<User>(users, 100, 1, 10);
    expect(response.meta.page).toBe(1);
    expect(response.meta.pageCount).toBe(10);
    expect(response.meta.pages).toBe(10);
    expect(response.meta.total).toBe(100);
  });
});
